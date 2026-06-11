const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const notificationService = require('../services/notificationService');

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            methods: ['GET', 'POST']
        },
        // Reconnection is handled client-side; server just accepts
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // ── Auth Middleware for Socket ──────────────────────────
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token ||
                          socket.handshake.headers?.authorization?.split(' ')[1];

            if (!token) {
                return next(new Error('Authentication error: No token provided.'));
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch {
                return next(new Error('Authentication error: Invalid or expired token.'));
            }

            // Fetch user + role from DB
            const result = await pool.query(`
                SELECT u.user_id, u.full_name, u.email, r.role_name
                FROM users u
                JOIN roles r ON u.role_id = r.role_id
                WHERE u.user_id = $1 AND u.is_active = TRUE
            `, [decoded.user_id]);

            if (result.rows.length === 0) {
                return next(new Error('Authentication error: User not found.'));
            }

            socket.user = result.rows[0];
            next();
        } catch (err) {
            console.error('Socket auth error:', err);
            next(new Error('Authentication error.'));
        }
    });

    // ── Connection Handler ──────────────────────────────────
    io.on('connection', async (socket) => {
        const userId = socket.user.user_id;
        console.log(`🔌 User connected: ${socket.user.full_name} (${userId})`);

        // Join personal room (user receives only their notifications)
        socket.join(`user:${userId}`);

        // ── Deliver stored offline notifications on reconnect ──
        try {
            const unread = await notificationService.getUnreadNotifications(userId);
            if (unread.length > 0) {
                socket.emit('stored_notifications', {
                    message: `You have ${unread.length} unread notification(s).`,
                    notifications: unread
                });
                console.log(`📬 Delivered ${unread.length} stored notification(s) to ${socket.user.full_name}`);
            }
        } catch (err) {
            console.error('Error delivering stored notifications:', err);
        }

        // ── Mark notification as read ───────────────────────
        socket.on('mark_read', async ({ notificationId }) => {
            try {
                await notificationService.markAsRead(notificationId, userId);
                socket.emit('notification_marked_read', { notificationId });
            } catch (err) {
                socket.emit('error', { message: 'Failed to mark notification as read.' });
            }
        });

        // ── Mark all notifications as read ──────────────────
        socket.on('mark_all_read', async () => {
            try {
                await notificationService.markAllAsRead(userId);
                socket.emit('all_notifications_marked_read');
            } catch (err) {
                socket.emit('error', { message: 'Failed to mark all notifications as read.' });
            }
        });

        // ── Disconnect ──────────────────────────────────────
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${socket.user.full_name} — Reason: ${reason}`);
        });
    });

    console.log('🔔 Socket.io notification server initialized.');
    return io;
};

// Send notification to a specific user (used by other modules)
const sendNotification = async ({ userId, title, message }) => {
    try {
        // Always store in DB (works for offline users too)
        const notification = await notificationService.createNotification({ userId, title, message });

        // If user is online, push it in real-time
        if (io) {
            io.to(`user:${userId}`).emit('new_notification', notification);
        }

        return notification;
    } catch (err) {
        console.error('sendNotification error:', err);
    }
};

const getIO = () => io;

module.exports = { initSocket, sendNotification, getIO };
