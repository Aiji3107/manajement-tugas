const express = require("express");
const dotenv = require("dotenv");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Middleware
app.use(express.json());

const authToken = (req, res, next) => {
  const token = req.headers.authtorization?.split(" ")[1]; //Mengambil token dari header authorization

  if (!token) {
    return res.status(401).send({
      message: "Access denied. No token provided.",
    });
  }
  const decode = jwt.verify(token, JWT_SECRET); //verify token
  req.userId = decode.userId;
  next();
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log("Express API running in PORT " + PORT);
});

// Post Login
app.post("/login", async (req, res) => {
  const newUser = req.body;
  const user = await prisma.user.findUnique({
    where: { email: newUser.email },
  });
  if (!user) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }
  const isValidPassword = await bcrypt.compare(newUser.password, user.password);
  // Check Password
  if (!isValidPassword) {
    return res.status(401).json({ message: "Email or password is incorrect" });
  }
  // Token JWT
  const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
    expiresIn: "1h",
  });
  res.send({
    message: "Login Success",
    token,
  });
});

// POST Register
app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  // Validasi input
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Email, password, and username are required" });
  }

  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already in use" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat pengguna baru di database
  try {
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword, // Simpan password yang sudah di-hash
        username: username
      },
    });

    // Buat JWT Token
    const token = jwt.sign({ userId: newUser.id }, process.env.SECRET_KEY, {
      expiresIn: "1h", // Token berlaku 1 jam
    });

    res.status(201).json({
      message: "User created successfully",
      token, // Kirim token JWT ke pengguna
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
});

// POST Task
app.post("/task", authToken, async (req, res) => {
  const newTask = req.body;

  // Periksa apakah data yang diperlukan ada
  if (!newTask.userId) {
    return res.status(400).json({ message: " userId are required" });
  }

  try {
    const task = await prisma.task.create({
      data: {
        title : newTask.title,
        description : newTask.description, // Opsional
        status: newTask.status || "PENDING", // Jika tidak diberikan, gunakan default
        priority: newTask.priority || "MEDIUM", // Jika tidak diberikan, gunakan default
        dueDate: newTask.dueDate, // Opsional
        userId: newTask.userId, // ID user yang membuat task
      },
    });

    res.send({
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});


// put Task
app.put("/task", async (req, res) => {
  const taskId = req.params.taskId;
  const newTask = req.body();

  const task = await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      title: newTask.title,
      description: newTask.description,
    },
  });
  res.send({
    message: "Task updated successfully",
    data: task,
  });
});

// delete Task
app.delete("/tasks/:taskId", async (req, res) => {
  const taskId = req.params.taskId;
  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });
  res.send({
    message: "Task deleted successfully",
  });
});

// Get TASKS
app.get("/task", authToken, async (req, res) => {
  // Panggil prisma tasks
  const tasks = await prisma.task.findMany({
    where: {
      userId: req.userId,
    },
  });
  res.send(tasks);
});

// POST user
app.post("/user", async (req, res) => {
  const newUser = req.body;

  // hashedpassword
  const hashedPassword = await bcrypt.hash(newUser.password, 10);
  const user = await prisma.user.create({
    data: {
      username: newUser.username,
      email: newUser.email,
      password: hashedPassword,
    },
  });

  res.send({
    message: "User created successfully",
    data: user,
  });
});

// Get USERS
app.get("/user", async (req, res) => {
  const users = await prisma.user.findMany();
  res.send(users);
});

app.delete("/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });
  res.send({ message: "User deleted successfully" });
});
