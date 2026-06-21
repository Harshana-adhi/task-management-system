const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async (email, fullName, temporaryPassword) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: 'Welcome to Task Management System',
        html: `
            <h2>Welcome, ${fullName}!</h2>
            <p>Your account has been created successfully.</p>
            <p>Here are your login credentials:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Temporary Password:</strong> ${temporaryPassword}</li>
            </ul>
            <p>Please login and change your password immediately.</p>
            <p>Login at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}</p>
            <br>
            <p>Task Management System</p>
        `
    });

    if (error) {
        console.error('Resend email error:', error);
        throw new Error('Failed to send welcome email');
    }

    return data;
};

module.exports = { sendWelcomeEmail };