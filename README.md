# Node Notification Service

A real-time notification microservice built with Node.js, Express, MySQL, and Socket.IO. This service is designed to work with Expo applications (both web and mobile) via HTTP and WebSocket.

## 📦 Features

- REST API to receive and store notifications
- WebSocket (Socket.IO) server for real-time delivery
- MySQL support for persistent notification storage
- Expo Push Notifications support for mobile devices
- Supports any frontend via Socket.io-client
- Designed to integrate with Expo apps

## ⚙️ Tech Stack

- Node.js
- Express.js
- MySQL
- WebSocket (Socket.IO)
- Expo Server SDK

## 📁 Directory Structure

```
.
├── src/
│ ├── app.js           # Express app setup
│ ├── server.js        # Main entry point
│ ├── db.js            # MySQL database client
│ ├── controllers/     # Route controllers
│ ├── routes/          # API routes
│ ├── services/        # Business logic
│ ├── middleware/      # Custom middleware
│ └── sockets/         # WebSocket handlers
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/node-notification-service.git
cd node-notification-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=4100
DB_HOST=your_host
DB_PORT=your_port
DB_USER=user
DB_PASSWORD=your_password
DB_NAME=your_db_name

# Expo Push Notifications
EXPO_ACCESS_TOKEN=your_expo_access_token  # Required if you have enabled push security
```

### 4. Run the Server

```bash
node src/server.js
```

## 🔌 API

### Push Notifications

#### Register Device Token

```http
POST /fcm/register
Content-Type: application/json

{
  "user_id": "123",
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

#### Send Notification

```http
POST /fcm/send
Content-Type: application/json

{
  "userId": "123",
  "notification": {
    "title": "New Message",
    "body": "You have a new message",
    "data": {
      "type": "message",
      "id": "456"
    }
  }
}
```

### Notifications

#### Create Notification

```http
POST /notifications
Content-Type: application/json

{
  "notifiable_id": 4,
  "notifiable_type": "App\Models\User",
  "type": "MessageReceived",
  "data": {
    "message": "New message received"
  }
}
```

#### Get User Notifications

```http
GET /notifications?user_id=4
```

#### Mark All as Read

```http
PUT /notifications/clear-all
Content-Type: application/json

{
  "user_id": 4
}
```

## 📱 Mobile Integration

To use push notifications in your Expo mobile app:

1. Install the required packages:
```bash
npx expo install expo-notifications
```

2. Get the Expo push token in your app:
```javascript
import * as Notifications from 'expo-notifications';

const token = await Notifications.getExpoPushTokenAsync({
  projectId: your_project_id // Get this from your Expo project
});
```

3. Send this token to your backend using the `/fcm/register` endpoint

## ⚠️ Important Notes

- Push notifications only work on physical devices, not on emulators/simulators
- Make sure to handle token refresh and re-registration in your mobile app
- The Expo push notification service has a limit of 600 notifications per second per project
- Always validate Expo push tokens before storing them

