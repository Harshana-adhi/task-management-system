require('dotenv').config();
const jwt = require('jsonwebtoken');

// ============================================================
// CONFIGURATION — Fill these in before running
// ============================================================

// Paste a Project Manager user_id from your users table
const TEST_USER_ID = '1809b4c6-cfcf-47b9-ba94-046c1c1ef842';
const TEST_ROLE_ID = 2; // Project Manager

// Paste any existing user_id to add as a project member
const MEMBER_USER_ID = 'abc238b4-9216-4ff3-b051-3826a2808741';
// Your backend base URL
const BASE_URL = 'http://localhost:5000/api';

// ============================================================

// Generate a test JWT token directly (no login endpoint needed)
const testToken = jwt.sign(
    { user_id: TEST_USER_ID, role_id: TEST_ROLE_ID },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${testToken}`
};

// Helper to print responses
const printResponse = (label, status, data) => {
    console.log(`\n--------------------------------------------`);
    console.log(`📡 ${label} (HTTP ${status})`);
    console.log(`--------------------------------------------`);
    console.log(JSON.stringify(data, null, 2));
    console.log(`--------------------------------------------`);
};

let createdProjectId = null;

async function runTests() {
    console.log('\n🚀 Starting Project Management API Test Pipeline...\n');
    console.log(`🔑 Test token generated for user: ${TEST_USER_ID}\n`);

    // ── TEST 1: Create Project ──────────────────────────────
    console.log('🔄 Test 1: POST /api/projects (Create Project)...');
    try {
        const res = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                projectName: 'Test Project ' + Date.now(),
                description: 'Created by automated test pipeline'
            })
        });
        const data = await res.json();
        printResponse('Create Project', res.status, data);

        if (data.success) {
            createdProjectId = data.project.project_id;
            console.log(`✅ Project created! ID: ${createdProjectId}`);
        } else {
            console.log('❌ Create failed — check role or token.');
        }
    } catch (err) {
        console.error('❌ Test 1 Error:', err.message);
    }

    // ── TEST 2: Get All Projects ────────────────────────────
    console.log('\n🔄 Test 2: GET /api/projects (View All Projects)...');
    try {
        const res = await fetch(`${BASE_URL}/projects`, { headers });
        const data = await res.json();
        printResponse('Get All Projects', res.status, data);
        if (data.success) console.log(`✅ Fetched ${data.projects.length} projects.`);
    } catch (err) {
        console.error('❌ Test 2 Error:', err.message);
    }

    // ── TEST 3: Get Project By ID ───────────────────────────
    if (createdProjectId) {
        console.log('\n🔄 Test 3: GET /api/projects/:id (View Single Project)...');
        try {
            const res = await fetch(`${BASE_URL}/projects/${createdProjectId}`, { headers });
            const data = await res.json();
            printResponse('Get Project By ID', res.status, data);
            if (data.success) console.log(`✅ Fetched project: ${data.project.project_name}`);
        } catch (err) {
            console.error('❌ Test 3 Error:', err.message);
        }
    }

    // ── TEST 4: Update Project ──────────────────────────────
    if (createdProjectId) {
        console.log('\n🔄 Test 4: PUT /api/projects/:id (Update Project)...');
        try {
            const res = await fetch(`${BASE_URL}/projects/${createdProjectId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    projectName: 'Updated Project Name',
                    description: 'Description updated by test pipeline'
                })
            });
            const data = await res.json();
            printResponse('Update Project', res.status, data);
            if (data.success) console.log(`✅ Project updated: ${data.project.project_name}`);
        } catch (err) {
            console.error('❌ Test 4 Error:', err.message);
        }
    }

    // ── TEST 5: Add Member ──────────────────────────────────
    if (createdProjectId && MEMBER_USER_ID !== 'PASTE_ANY_OTHER_USER_UUID_HERE') {
        console.log('\n🔄 Test 5: POST /api/projects/:id/members (Add Member)...');
        try {
            const res = await fetch(`${BASE_URL}/projects/${createdProjectId}/members`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ userId: MEMBER_USER_ID })
            });
            const data = await res.json();
            printResponse('Add Member', res.status, data);
            if (data.success) console.log(`✅ Member added: ${data.member.full_name}`);
        } catch (err) {
            console.error('❌ Test 5 Error:', err.message);
        }
    } else {
        console.log('\n⚠️  Test 5 skipped — set MEMBER_USER_ID at the top of this file.');
    }

    // ── TEST 6: Get Project Members ─────────────────────────
    if (createdProjectId) {
        console.log('\n🔄 Test 6: GET /api/projects/:id/members (View Members)...');
        try {
            const res = await fetch(`${BASE_URL}/projects/${createdProjectId}/members`, { headers });
            const data = await res.json();
            printResponse('Get Project Members', res.status, data);
            if (data.success) console.log(`✅ Fetched ${data.members.length} member(s).`);
        } catch (err) {
            console.error('❌ Test 6 Error:', err.message);
        }
    }

    console.log('\n🏁 All tests completed!\n');
    process.exit(0);
}

runTests();