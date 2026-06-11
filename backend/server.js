const { setDefaultResultOrder } = require('dns');
setDefaultResultOrder('ipv4first');

const express = require('express');
const http = require('http');
require('dotenv').config();

const projectRoutes = require('./src/routes/projectRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { initSocket } = require('./src/socket/notificationSocket');
const { startDeadlineChecker } = require('./src/jobs/deadlineChecker');

const app = express();
const httpServer = http.createServer(app); // Wrap express in HTTP server for Socket.io

app.use(express.json());

// REST API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
    res.send('🚀 Task Management Shared Core API is Active.');
});

// Initialize Socket.io on the HTTP server
initSocket(httpServer);

// Start deadline background job
startDeadlineChecker();

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`🚀 System server tracking operational on Port ${PORT}`);
    console.log(`🔔 WebSocket server ready on ws://localhost:${PORT}`);
});
