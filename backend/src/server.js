const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/errorMiddleware');
const { initSocket } = require('./sockets/notificationSocket');
const { startDeadlineChecker } = require('./jobs/deadlineChecker');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);

// API documentation (Swagger UI)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Task Management System API is running' });
});

// 404 handler (after all routes)
app.use(notFoundMiddleware);

// Global error handler (must be last)
app.use(errorMiddleware);

// Initialize Socket.io
initSocket(httpServer);

// Start deadline checker
startDeadlineChecker();

// Start server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;