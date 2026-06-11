require('dotenv').config();
const jwt = require('jsonwebtoken');
const { io } = require('socket.io-client');

// ============================================================
// CONFIGURATION
// ============================================================
const TEST_USER_ID   = '1809b4c6-cfcf-47b9-ba94-046c1c1ef842'; // Project Manager
const TEST_USER_ID_2 = 'abc238b4-9216-4ff3-b051-3826a2808741'; // Admin2 User
const ADMIN_USER_ID  = 'a91062be-d0ea-4671-a413-43d53e0d3a96';            // get from: SELECT user_id FROM users JOIN roles ON users.role_id = roles.role_id WHERE role_name = 'Admin' LIMIT 1;
const BASE_URL       = 'http://localhost:5000';
// ============================================================

const makeToken = (userId) => jwt.sign(
    { user_id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const headers = (userId) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${makeToken(userId)}`
});

const print = (label, status, data) => {
    console.log(`\n--------------------------------------------`);
    console.log(`📡 ${label} (HTTP ${status})`);
    console.log(`--------------------------------------------`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`--------------------------------------------`);
};

async function runNotificationTests() {
    console.log('\n🚀 Starting Notification API + WebSocket Test Pipeline...\n');

    // ── TEST 1: WebSocket Connection + stored notifications ──
    console.log('🔄 Test 1: WebSocket Connection & Stored Notification Delivery...');
    await new Promise((resolve) => {
        const token = makeToken(TEST_USER_ID);
        const socket = io(BASE_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000
        });

        socket.on('connect', () => {
            console.log(`✅ WebSocket connected! Socket ID: ${socket.id}`);
        });

        socket.on('stored_notifications', ({ notifications, message }) => {
            console.log(`📬 ${message}`);
            console.log(JSON.stringify(notifications, null, 2));
        });

        socket.on('new_notification', (notification) => {
            console.log('🔔 Real-time notification received:');
            console.log(JSON.stringify(notification, null, 2));
        });

        socket.on('connect_error', (err) => {
            console.error('❌ WebSocket connection error:', err.message);
        });

        // Disconnect after 5 seconds
        setTimeout(() => {
            socket.disconnect();
            console.log('🔌 WebSocket disconnected after test.');
            resolve();
        }, 5000);
    });

    // ── TEST 2: GET /api/notifications ───────────────────────
    console.log('\n🔄 Test 2: GET /api/notifications (Get My Notifications)...');
    try {
        const res = await fetch(`${BASE_URL}/api/notifications`, { headers: headers(TEST_USER_ID) });
        const data = await res.json();
        print('Get My Notifications', res.status, data);
        if (data.success) console.log(`✅ Fetched ${data.notifications.length} notification(s).`);
    } catch (err) {
        console.error('❌ Test 2 Error:', err.message);
    }

    // ── TEST 3: PATCH /api/notifications/read-all ────────────
    console.log('\n🔄 Test 3: PATCH /api/notifications/read-all (Mark All Read)...');
    try {
        const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
            method: 'PATCH',
            headers: headers(TEST_USER_ID)
        });
        const data = await res.json();
        print('Mark All Read', res.status, data);
        if (data.success) console.log('✅ All notifications marked as read.');
    } catch (err) {
        console.error('❌ Test 3 Error:', err.message);
    }

    // ── TEST 4: Admin Broadcast ──────────────────────────────
    if (ADMIN_USER_ID !== 'PASTE_ADMIN_USER_UUID_HERE' && TEST_USER_ID_2 !== 'PASTE_ANOTHER_USER_UUID_HERE') {
        console.log('\n🔄 Test 4: POST /api/notifications/admin-broadcast...');
        try {
            const res = await fetch(`${BASE_URL}/api/notifications/admin-broadcast`, {
                method: 'POST',
                headers: headers(ADMIN_USER_ID),
                body: JSON.stringify({
                    userId: TEST_USER_ID_2,
                    message: 'System maintenance scheduled for tonight at 10PM.'
                })
            });
            const data = await res.json();
            print('Admin Broadcast', res.status, data);
            if (data.success) console.log('✅ Admin notification sent.');
        } catch (err) {
            console.error('❌ Test 4 Error:', err.message);
        }
    } else {
        console.log('\n⚠️  Test 4 skipped — set ADMIN_USER_ID and TEST_USER_ID_2 at the top.');
    }

    console.log('\n🏁 Notification tests completed!\n');
    process.exit(0);
}

runNotificationTests();
