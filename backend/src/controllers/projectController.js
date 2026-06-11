const projectService = require('../services/projectService');

// POST /api/projects
const createProject = async (req, res) => {
    try {
        const { projectName, description } = req.body;
        const createdBy = req.user.user_id;
        const userRole = req.user.role_name;

        if (!projectName || projectName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Project name is required.'
            });
        }

        // Only Admin or Project Manager can create projects
        if (!['Admin', 'Project Manager'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Only Admins or Project Managers can create projects.'
            });
        }

        const project = await projectService.createProject({ projectName, description, createdBy });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully.',
            project
        });
    } catch (error) {
        console.error('createProject error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// GET /api/projects
const getAllProjects = async (req, res) => {
    try {
        const projects = await projectService.getAllProjects();
        return res.status(200).json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('getAllProjects error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// GET /api/projects/:projectId
const getProjectById = async (req, res) => {
    try {
        const { projectId } = req.params;
        const project = await projectService.getProjectById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Project not found.'
            });
        }

        return res.status(200).json({
            success: true,
            project
        });
    } catch (error) {
        console.error('getProjectById error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// PUT /api/projects/:projectId
const updateProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { projectName, description } = req.body;
        const userRole = req.user.role_name;
        const userId = req.user.user_id;

        if (!['Admin', 'Project Manager'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Only Admins or Project Managers can update projects.'
            });
        }

        if (!projectName || projectName.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'Project name is required.'
            });
        }

        const existing = await projectService.getProjectById(projectId);
        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Project not found.'
            });
        }

        // Project Managers can only update their own projects
        if (userRole === 'Project Manager' && existing.created_by !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You can only update projects you created.'
            });
        }

        const updated = await projectService.updateProject(projectId, { projectName, description });

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully.',
            project: updated
        });
    } catch (error) {
        console.error('updateProject error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// POST /api/projects/:projectId/members
const addMember = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;
        const userRole = req.user.role_name;
        const requesterId = req.user.user_id;

        if (!['Admin', 'Project Manager'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Only Admins or Project Managers can add members.'
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                message: 'userId is required.'
            });
        }

        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Project not found.'
            });
        }

        if (userRole === 'Project Manager' && project.created_by !== requesterId) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'You can only manage members of projects you created.'
            });
        }

        const member = await projectService.addMember(projectId, userId);

        return res.status(201).json({
            success: true,
            message: 'Member added to project successfully.',
            member
        });
    } catch (error) {
        console.error('addMember error:', error);

        // Handle duplicate member
        if (error.message.includes('already a member')) {
            return res.status(409).json({
                success: false,
                error: 'Conflict',
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: error.message
        });
    }
};

// GET /api/projects/:projectId/members
const getProjectMembers = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: 'Project not found.'
            });
        }

        const members = await projectService.getProjectMembers(projectId);

        return res.status(200).json({
            success: true,
            projectId,
            members
        });
    } catch (error) {
        console.error('getProjectMembers error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
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
    getProjectMembers
};
