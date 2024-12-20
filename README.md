# API Documentation

## Installation and Running the API

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd <repository_folder>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file and configure the following variables:
   ```
   PORT=3000
   SECRET_KEY=your_secret_key
   ```

4. **Run the Server**:
   ```bash
   npm start
   ```

---

## API Endpoints

### Root Endpoint
- **URL**: `/`
- **Method**: `GET`
- **Description**: Checks if the server is running.
- **Response**:
  ```json
  "Hello World!"
  ```

---

### User Authentication

#### Login
- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Login Success",
    "token": "jwt_token"
  }
  ```

#### Register
- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "username": "username"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User created successfully",
    "token": "jwt_token"
  }
  ```

---

### Task Management

#### Create Task
- **URL**: `/task`
- **Method**: `POST`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "title": "New Task",
    "description": "Task Description"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Task created successfully",
    "data": {
      "id": 1,
      "title": "New Task",
      "description": "Task Description"
    }
  }
  ```

#### Update Task
- **URL**: `/task/:taskId`
- **Method**: `PUT`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Request Body**:
  ```json
  {
    "title": "Updated Task",
    "description": "Updated Description"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Task updated successfully",
    "data": {
      "id": 1,
      "title": "Updated Task",
      "description": "Updated Description"
    }
  }
  ```

#### Delete Task
- **URL**: `/task/:taskId`
- **Method**: `DELETE`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  {
    "message": "Task deleted successfully"
  }
  ```

#### Get All Tasks
- **URL**: `/task`
- **Method**: `GET`
- **Headers**:
  ```
  Authorization: Bearer jwt_token
  ```
- **Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Task 1"
    },
    {
      "id": 2,
      "title": "Task 2"
    }
  ]
  ```

---

### User Management

#### Get All Users
- **URL**: `/user`
- **Method**: `GET`
- **Response**:
  ```json
  [
    {
      "id": 1,
      "email": "user1@example.com"
    },
    {
      "id": 2,
      "email": "user2@example.com"
    }
  ]
  ```

#### Delete User
- **URL**: `/user/:userId`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "User deleted successfully"
  }
  
