
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

let socket = null;

// ── Connect with JWT token ───────────────────────────────────
export const connectSocket = (token, { onNotification, onStoredNotifications } = {}) => {
    if (socket?.connected) return socket;

    socket = io(SOCKET_URL, {
        auth: { token },

        // ── Reconnection Strategy (retry with exponential backoff) ──
        reconnection: true,
        reconnectionAttempts: 10,       // Try 10 times before giving up
        reconnectionDelay: 1000,        // Start with 1 second delay
        reconnectionDelayMax: 30000,    // Max 30 seconds between retries
        randomizationFactor: 0.5,       // Add randomness to avoid thundering herd
        timeout: 20000
    });

    // ── Connection Events ────────────────────────────────────
    socket.on('connect', () => {
        console.log('🔌 Connected to notification server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.warn('🔌 Disconnected:', reason);
        if (reason === 'io server disconnect') {
            // Server forced disconnect (e.g. auth failed) — reconnect manually
            socket.connect();
        }
        // For other reasons, socket.io auto-reconnects with backoff
    });

    socket.on('connect_error', (err) => {
        console.error('🔌 Connection error:', err.message);
    });

    socket.on('reconnect', (attempt) => {
        console.log(`🔄 Reconnected after ${attempt} attempt(s).`);
    });

    socket.on('reconnect_attempt', (attempt) => {
        console.log(`🔄 Reconnection attempt #${attempt}...`);
    });

    socket.on('reconnect_failed', () => {
        console.error('🔄 Reconnection failed after max attempts.');
    });

    // ── Notification Events ──────────────────────────────────

    // Real-time new notification
    socket.on('new_notification', (notification) => {
        console.log('🔔 New notification:', notification);
        if (onNotification) onNotification(notification);
    });

    // Stored offline notifications delivered on reconnect
    socket.on('stored_notifications', ({ notifications, message }) => {
        console.log('📬', message);
        if (onStoredNotifications) onStoredNotifications(notifications);
    });

    // Confirmation events
    socket.on('notification_marked_read', ({ notificationId }) => {
        console.log('✅ Notification marked read:', notificationId);
    });

    socket.on('all_notifications_marked_read', () => {
        console.log('✅ All notifications marked as read.');
    });

    socket.on('error', ({ message }) => {
        console.error('Socket error:', message);
    });

    return socket;
};

// ── Mark a notification as read ─────────────────────────────
export const markNotificationRead = (notificationId) => {
    socket?.emit('mark_read', { notificationId });
};

// ── Mark all notifications as read ──────────────────────────
export const markAllNotificationsRead = () => {
    socket?.emit('mark_all_read');
};

// ── Disconnect ───────────────────────────────────────────────
export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};

export default socket;
