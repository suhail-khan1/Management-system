
# Node.js Management System

This project is a Node.js backend built with **TypeScript**. It includes services for:

- **Authentication** (JWT-based)
- **User Management** (roles: admin, editor, viewer)
- **Document Management** (CRUD + upload)
- **Ingestion Management** (triggering and tracking ingestion jobs)

Each service is modular, with separate controller, route, model, and test files.

---

## Project Structure

|--- auth/                # Authentication service
│   |--- controller/
│   |--- routes/
│   |--- model/
│   |--- tests/
|--- user/                # User management service
│   |--- controller/
│   |--- routes/
│   |--- model/
│   |--- tests/
|--- document/            # Document management service
│   |--- controller/
│   |--- routes/
│   |--- model/
│   |--- tests/
|--- ingestion/           # Ingestion management service
│   |--- controller/
│   |--- routes/
│   |--- model/
│   |--- tests/
|--- middleware/          # middlewares (e.g., auth)
|--- utils/               # Utility functions
|--- config/              # Configuration files (MongoDB, environment)
|--- server.ts            # App entry point
|--- .env                 # Environment variables
|--- tsconfig.json        # TypeScript config
|--- package.json         # Dependencies, script
|--- README.md

---

## Setup Instructions

### 1.Clone the Repository

git clone https://github.com/suhail-khan1/management-system.git
cd management-system/backend

### 2. Install Dependencies

npm install

---

## Running the Application

npx ts-node server.ts

Or with **nodemon**:

npx nodemon server.ts


### Production Build

## Compile TypeScript:

npm run build

Start compiled JS:

npm start

---

## Running Tests

This project uses **JasmineJS** for unit testing.

### To run all test cases:

npx jasmine

---

## Technologies Used

- **Node.js** + **ExpressJS**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **JasmineJS** for unit testing

---

## Services Summary

| Service      | Description                              | Folder       |
|--------------|------------------------------------------|--------------|
| Auth         | Register, login, logout, role handling   | `auth/`      |
| User         | Admin role/user management               | `user/`      |
| Document     | CRUD + upload support                    | `document/`  |
| Ingestion    | Trigger/track ingestion jobs             | `ingestion/` |
