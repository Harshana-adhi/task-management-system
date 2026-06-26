const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById, findUserByIdWithPassword, updatePassword } = require('../repositories/authRepository');

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

module.exports = { loginUser, getUserById, changePassword };