// Import modules
const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Authentication middleware
const authToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

// Routes

// Root endpoint
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// User Authentication
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login Success", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Email, password, and username are required" });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, username },
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.SECRET_KEY, { expiresIn: "1h" });
    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
});

// Task Management
app.post("/task", authToken, async (req, res) => {
  const { title, description, status = "PENDING", priority = "MEDIUM", dueDate } = req.body;

  try {
    const task = await prisma.task.create({
      data: { title, description, status, priority, dueDate, userId: req.userId },
    });
    res.json({ message: "Task created successfully", data: task });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
});

app.put("/task/:taskId", authToken, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, priority, dueDate } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { title, description, status, priority, dueDate },
    });
    res.json({ message: "Task updated successfully", data: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

app.delete("/task/:taskId", authToken, async (req, res) => {
  const { taskId } = req.params;

  try {
    await prisma.task.delete({ where: { id: taskId } });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

app.get("/task", authToken, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({ where: { userId: req.userId } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving tasks", error: error.message });
  }
});

// User Management
app.get("/user", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users", error: error.message });
  }
});

app.delete("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Express API running on PORT ${PORT}`);
});
