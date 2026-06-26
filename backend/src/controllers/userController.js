const userService = require('../services/userService');
const { sendNotification } = require('../sockets/notificationSocket');

const createUser = async (req, res) => {
    try {
        const { full_name, email, role_id } = req.body;

        if (!full_name || !email || !role_id) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Full name, email and role are required'
            });
        }

        const user = await userService.createUser(full_name, email, role_id);

        return res.status(201).json({
            message: 'User created successfully',
            user
        });

    } catch (error) {
        const isValidationError = error.message === 'Email already exists';
        return res.status(isValidationError ? 400 : 500).json({
            error: isValidationError ? 'Bad Request' : 'Internal Server Error',
            message: isValidationError ? error.message : 'Failed to create user'
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { search, role_id, is_active } = req.query;

        const isActive = is_active !== undefined
            ? is_active === 'true'
            : undefined;

        const users = await userService.getAllUsers(search, role_id, isActive);

        return res.status(200).json(users);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch users'
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.getUserById(userId);
        return res.status(200).json(user);

    } catch (error) {
        const isNotFound = error.message === 'User not found';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { full_name, email, role_id } = req.body;

        const user = await userService.updateUser(userId, {
            full_name, email, role_id
        });

        return res.status(200).json({
            message: 'User updated successfully',
            user
        });

    } catch (error) {
        const isNotFound = error.message === 'User not found';
        const isValidationError = error.message === 'Email already exists';
        const status = isNotFound ? 404 : isValidationError ? 400 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isValidationError ? 'Bad Request' : 'Internal Server Error',
            message: error.message
        });
    }
};

const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.deactivateUser(userId);

        sendNotification({
            userId,
            title: 'Account Deactivated',
            message: `Your account was deactivated by ${req.user.full_name}. Contact an administrator if you believe this is a mistake.`
        });

        return res.status(200).json({
            message: 'User deactivated successfully',
            user
        });

    } catch (error) {
        const isNotFound = error.message === 'User not found';
        const isValidationError = error.message === 'User is already deactivated';
        const status = isNotFound ? 404 : isValidationError ? 400 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isValidationError ? 'Bad Request' : 'Internal Server Error',
            message: error.message
        });
    }
};

const activateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userService.activateUser(userId);

        sendNotification({
            userId,
            title: 'Account Reactivated',
            message: `Your account was reactivated by ${req.user.full_name}. You can log in again.`
        });

        return res.status(200).json({
            message: 'User activated successfully',
            user
        });

    } catch (error) {
        const isNotFound = error.message === 'User not found';
        const isValidationError = error.message === 'User is already active';
        const status = isNotFound ? 404 : isValidationError ? 400 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isValidationError ? 'Bad Request' : 'Internal Server Error',
            message: error.message
        });
    }
};

const assignRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role_id } = req.body;

        if (!role_id) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Role ID is required'
            });
        }

        const user = await userService.assignRole(userId, role_id);

        sendNotification({
            userId,
            title: 'Role Updated',
            message: `${req.user.full_name} updated your account role. Refresh or log in again to see your new permissions.`
        });

        return res.status(200).json({
            message: 'Role assigned successfully',
            user
        });

    } catch (error) {
        const isNotFound = error.message === 'User not found';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const roles = await userService.getAllRoles();
        return res.status(200).json(roles);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch roles'
        });
    }
};

const getUserLookup = async (req, res) => {
    try {
        const { search, role_name } = req.query;
        // role_name can be a single role ("Collaborator") or a
        // comma-separated list ("Project Manager,Collaborator") — the
        // latter is how Admin's "add member" picker excludes Admin users
        // without excluding PMs (who can also be regular members of
        // someone else's project).
        const roleNames = role_name ? role_name.split(',').map((r) => r.trim()) : undefined;
        const users = await userService.getUserLookup(search, roleNames);
        return res.status(200).json(users);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch users'
        });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deactivateUser,
    activateUser,
    assignRole,
    getAllRoles,
    getUserLookup
};