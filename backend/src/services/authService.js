const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById } = require('../repositories/authRepository');

const loginUser = async (email, password) => {
    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
        throw new Error('Your account has been deactivated');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT token
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
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

module.exports = { loginUser, getUserById };