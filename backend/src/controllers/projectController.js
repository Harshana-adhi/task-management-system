const projectService = require('../services/projectService');

const createProject = async (req, res) => {
    try {
        const { projectName, description } = req.body;
        const createdBy = req.user.user_id;

        if (!projectName || projectName.trim() === '') {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Project name is required'
            });
        }

        const project = await projectService.createProject(projectName, description, createdBy);

        return res.status(201).json({
            message: 'Project created successfully',
            project
        });

    } catch (error) {
        const isConflict = error.message === 'You already have a project with this name';
        return res.status(isConflict ? 409 : 500).json({
            error: isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const projects = await projectService.getAllProjects(userId, userRole);
        return res.status(200).json(projects);

    } catch (error) {
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch projects'
        });
    }
};

const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const project = await projectService.getProjectById(projectId, userId, userRole);
        return res.status(200).json(project);

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { projectName, description } = req.body;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!projectName || projectName.trim() === '') {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Project name is required'
            });
        }

        const project = await projectService.updateProject(
            projectId, projectName, description, userId, userRole
        );

        return res.status(200).json({
            message: 'Project updated successfully',
            project
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'You can only update projects you created';
        const isConflict = error.message === 'You already have a project with this name';
        const status = isNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        if (!userId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'User ID is required'
            });
        }

        const member = await projectService.addMember(projectId, userId, requesterId, userRole);

        return res.status(201).json({
            message: 'Member added successfully',
            member
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'You can only manage members of projects you created';
        const isConflict = error.message === 'User is already a member of this project';
        const isUserNotFound = error.message === 'User not found or inactive';
        const status = isNotFound || isUserNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound || isUserNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const removeMember = async (req, res) => {
    try {
        const { projectId, userId } = req.params;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        await projectService.removeMember(projectId, userId, requesterId, userRole);

        return res.status(200).json({
            message: 'Member removed successfully'
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found' ||
                           error.message === 'Member not found in this project';
        const isForbidden = error.message === 'You can only manage members of projects you created';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const getProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user.user_id;
        const userRole = req.user.role_name;

        const members = await projectService.getProjectMembers(projectId, userId, userRole);

        return res.status(200).json({
            projectId,
            members
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found or access denied';
        return res.status(isNotFound ? 404 : 500).json({
            error: isNotFound ? 'Not Found' : 'Internal Server Error',
            message: error.message
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    addMember,
    removeMember,
    getProjectMembers
};