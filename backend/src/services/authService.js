const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserById } = require('../repositories/authRepository');

const loginUser = async (email, password) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('AUTH_CONFIG_ERROR');
    }

    const user = await findUserByEmail(email);

    const isValidPassword = user 
        ? await bcrypt.compare(password, user.password_hash) 
        : false;

    if (!user || !isValidPassword || !user.is_active) {
        throw new Error('Invalid email or password');
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

module.exports = { loginUser, getUserById };