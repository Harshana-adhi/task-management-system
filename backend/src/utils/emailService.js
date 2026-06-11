const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (email, fullName, temporaryPassword) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };