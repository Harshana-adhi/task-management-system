const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { sendWelcomeEmail } = require('../utils/emailService');

const createUser = async (fullName, email, roleId) => {
    // Check if email already exists
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Generate temporary password
    const temporaryPassword = Math.random().toString(36).slice(-8) + 'A1!';

    // Hash password
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Create user
    const user = await userRepository.createUser(fullName, email, passwordHash, roleId);

    // Send welcome email with temporary password
    await sendWelcomeEmail(email, fullName, temporaryPassword);

    return user;
};

const getAllUsers = async (search, roleId, isActive) => {
    return await userRepository.getAllUsers(search, roleId, isActive);
};

const getUserById = async (userId) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    return user;
};

const updateUser = async (userId, fields) => {
    // Check if user exists
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Check if email already taken
    if (fields.email) {
        const existingUser = await userRepository.getUserByEmail(fields.email);
        if (existingUser && existingUser.user_id !== userId) {
            throw new Error('Email already exists');
        }
    }

    return await userRepository.updateUser(userId, fields);
};

const deactivateUser = async (userId) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    if (!user.is_active) throw new Error('User is already deactivated');
    return await userRepository.deactivateUser(userId);
};

const activateUser = async (userId) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    if (user.is_active) throw new Error('User is already active');
    return await userRepository.activateUser(userId);
};

const assignRole = async (userId, roleId) => {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new Error('User not found');
    return await userRepository.updateUser(userId, { role_id: roleId });
};

const getAllRoles = async () => {
    return await userRepository.getAllRoles();
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    assignRole,
    getAllRoles
};