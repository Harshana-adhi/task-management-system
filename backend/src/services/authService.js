const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, findUserByIdWithPassword, updatePassword, setTemporaryPassword } = require('../repositories/authRepository');
const { sendPasswordResetEmail } = require('../utils/emailService');

const loginUser = async (email, password) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('AUTH_CONFIG_ERROR');
    }

    const user = await findUserByEmail(email);

    const isValidPassword = user
        ? await bcrypt.compare(password, user.password_hash)
        : false;

    if (!user || !isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Checked only after credentials are confirmed valid — otherwise this
    // would leak whether a given email exists in the system to anyone
    // who tries it, regardless of password.
    if (!user.is_active) {
        throw new Error('ACCOUNT_DEACTIVATED');
    }

    const token = jwt.sign(
        { 
            userId: user.user_id, 
            roleId: user.role_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return {
        token,
        mustChangePassword: user.must_change_password,
        user: {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            roleId: user.role_id
        }
    };
};

const getUserById = async (userId) => {
    const user = await findUserById(userId);
    return user || null;
};

const changePassword = async (userId, currentPassword, newPassword) => {
    // Use findUserByIdWithPassword to get password_hash
    const user = await findUserByIdWithPassword(userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
        throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
    }

    if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const updatedUser = await updatePassword(userId, passwordHash);
    return updatedUser;
};

// Self-service password reset. Deliberately always resolves the same way
// to the caller (controller returns one generic message regardless of
// outcome) — this function is where the actual "does this email exist /
// is it active" branching happens, so the controller never has to leak
// that distinction in its response.
//
// On a match: generates a fresh temporary password (same format used
// when an Admin creates a user), hashes it, stores it, sets
// must_change_password = TRUE so the person is forced to set their own
// password right after logging in, then emails it via Resend.
const forgotPassword = async (email) => {
    const user = await findUserByEmail(email);

    if (!user || !user.is_active) {
        // Deliberately not thrown as an error — the controller treats this
        // identically to the success path so a bad actor can't use this
        // endpoint to discover which emails are registered or active.
        return { sent: false };
    }

    const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    await setTemporaryPassword(user.user_id, passwordHash);
    await sendPasswordResetEmail(user.email, user.full_name, temporaryPassword);

    return { sent: true };
};

module.exports = { loginUser, getUserById, changePassword, forgotPassword };