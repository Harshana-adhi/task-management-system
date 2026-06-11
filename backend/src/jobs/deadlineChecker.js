const pool = require('../config/db');
const { sendNotification } = require('../socket/notificationSocket');

// Runs every hour — finds tasks due within 24 hours and notifies assigned users
const startDeadlineChecker = () => {
    const CHECK_INTERVAL_MS = 60 * 60 * 1000; // every 1 hour

    const checkDeadlines = async () => {
        console.log('⏰ Running deadline checker...');
        try {
            // Find tasks due within the next 24 hours that are not completed
            const query = `
                SELECT 
                    t.task_id,
                    t.title,
                    t.due_date,
                    t.status,
                    p.project_name,
                    ta.user_id AS assigned_user_id
                FROM tasks t
                JOIN task_assignments ta ON t.task_id = ta.task_id
                JOIN projects p ON t.project_id = p.project_id
                WHERE 
                    t.due_date BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
                    AND t.status != 'Completed';
            `;

            const result = await pool.query(query);

            for (const task of result.rows) {
                await sendNotification({
                    userId: task.assigned_user_id,
                    title: '⚠️ Deadline Approaching',
                    message: `Task "${task.title}" in project "${task.project_name}" is due within 24 hours. Please ensure timely completion.`
                });
            }

            if (result.rows.length > 0) {
                console.log(`⏰ Sent ${result.rows.length} deadline reminder(s).`);
            }
        } catch (err) {
            console.error('Deadline checker error:', err);
        }
    };

    // Run immediately on startup, then every hour
    checkDeadlines();
    setInterval(checkDeadlines, CHECK_INTERVAL_MS);
    console.log('⏰ Deadline checker started (runs every hour).');
};

module.exports = { startDeadlineChecker };
