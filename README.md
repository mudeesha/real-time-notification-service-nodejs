# Node Notification Service

A real-time notification microservice built with Node.js, Express, PostgreSQL, and Socket.IO. This service is designed to work with Laravel-based applications (both web and mobile) via HTTP and WebSocket.

## 📦 Features

- REST API to receive and store notifications
- WebSocket (Socket.IO) server for real-time delivery
- PostgreSQL support for persistent notification storage
- Supports any frontend via Laravel Echo + socket.io-client
- Designed to integrate with Laravel apps (Blade / React Native)

## ⚙️ Tech Stack

- Node.js
- Express.js
- PostgreSQL
- WebSocket (Socket.IO)
- Laravel Echo

## 📁 Directory Structure

.
├── src/
│ ├── index.js # Main entry point
│ ├── db.js # PostgreSQL database client
│ └── ... # Future enhancements
├── .env # Environment config (not committed)
├── .gitignore
├── package.json
└── README.md


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/node-notification-service.git
cd node-notification-service


### 2. Install Dependencies

npm install

### 3. Configure Environment Variables

PORT=4000
DATABASE_URL=postgresql://username:password@localhost:5432/your_db

### 4. Run the Server

node src/index.js


### 🔌 API

POST /notify
{
  "id": "uuid",
  "notifiable_id": 4,
  "notifiable_type": "App\\Models\\User",
  "type": "GuardianUpdated",
  "data": {
    "sender_id": 1,
    "message": "Guardian updated - Mudeesha Tharindu"
}
