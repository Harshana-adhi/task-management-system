const projectService = require('../services/projectService');
const { sendNotification } = require('../sockets/notificationSocket');

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
        const isForbidden = error.message === 'You can only update projects you created or are assigned to manage';
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
        const isForbidden = error.message === 'You can only manage members of projects you created or are assigned to manage' ||
                            error.message === 'Project Managers can only add Collaborators to a project';
        const isValidation = error.message === 'Admin accounts cannot be added as project members';
        const isConflict = error.message === 'User is already a member of this project'
                            || error.message === 'This user already manages the project and cannot also be added as a member';
        const isUserNotFound = error.message === 'User not found or inactive';
        const status = isNotFound || isUserNotFound ? 404 : isForbidden ? 403 : isValidation ? 400 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound || isUserNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isValidation ? 'Validation Error' : isConflict ? 'Conflict' : 'Internal Server Error',
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
        const isForbidden = error.message === 'You can only manage members of projects you created or are assigned to manage';
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

const archiveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        const project = await projectService.archiveProject(projectId, requesterId, userRole);
        return res.status(200).json({
            message: 'Project archived successfully',
            project
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'You can only archive projects you created or are assigned to manage';
        const isConflict = error.message === 'Project is already archived';
        const status = isNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const unarchiveProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const requesterId = req.user.user_id;
        const userRole = req.user.role_name;

        const project = await projectService.unarchiveProject(projectId, requesterId, userRole);
        return res.status(200).json({
            message: 'Project unarchived successfully',
            project
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'You can only unarchive projects you created or are assigned to manage';
        const isConflict = error.message === 'Project is not archived';
        const status = isNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const deleteProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userRole = req.user.role_name;

        await projectService.deleteProject(projectId, userRole);
        return res.status(200).json({
            message: 'Project deleted permanently'
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'Only an Administrator can permanently delete a project';
        const status = isNotFound ? 404 : isForbidden ? 403 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : 'Internal Server Error',
            message: error.message
        });
    }
};

const assignManager = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { userId } = req.body;
        const userRole = req.user.role_name;

        if (!userId) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'User ID is required'
            });
        }

        const project = await projectService.assignManager(projectId, userId, userRole);

        sendNotification({
            userId,
            title: 'Assigned as Project Manager',
            message: `${req.user.full_name} assigned you to manage the project "${project.project_name}".`
        });

        return res.status(200).json({
            message: 'Project manager assigned successfully',
            project
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found' || error.message === 'User not found';
        const isForbidden = error.message === 'Only an Administrator can assign a project manager';
        const isValidation = error.message === 'Only a user with the Project Manager role can be assigned to manage a project';
        const isConflict = error.message === 'This user is already the assigned manager for this project';
        const status = isNotFound ? 404 : isForbidden ? 403 : isValidation ? 400 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isValidation ? 'Validation Error' : isConflict ? 'Conflict' : 'Internal Server Error',
            message: error.message
        });
    }
};

const unassignManager = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userRole = req.user.role_name;

        const { project, previousManagerId } = await projectService.unassignManager(projectId, userRole);

        sendNotification({
            userId: previousManagerId,
            title: 'Removed as Project Manager',
            message: `${req.user.full_name} unassigned you from managing the project "${project.project_name}".`
        });

        return res.status(200).json({
            message: 'Project manager unassigned successfully',
            project
        });

    } catch (error) {
        const isNotFound = error.message === 'Project not found';
        const isForbidden = error.message === 'Only an Administrator can unassign a project manager';
        const isConflict = error.message === 'This project has no manager to unassign';
        const status = isNotFound ? 404 : isForbidden ? 403 : isConflict ? 409 : 500;
        return res.status(status).json({
            error: isNotFound ? 'Not Found' : isForbidden ? 'Forbidden' : isConflict ? 'Conflict' : 'Internal Server Error',
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
    getProjectMembers,
    archiveProject,
    unarchiveProject,
    deleteProject,
    assignManager,
    unassignManager
};