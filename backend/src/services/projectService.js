const projectRepository = require('../repositories/projectRepository');

const createProject = async (projectName, description, createdBy) => {
    return await projectRepository.createProject(projectName, description, createdBy);
};

const getAllProjects = async (userId, userRole) => {
    return await projectRepository.getAllProjects(userId, userRole);
};

const getProjectById = async (projectId, userId, userRole) => {
    const project = await projectRepository.getProjectById(projectId, userId, userRole);
    if (!project) throw new Error('Project not found');
    return project;
};

const updateProject = async (projectId, projectName, description, userId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    if (userRole === 'Project Manager' && project.created_by !== userId) {
        throw new Error('You can only update projects you created');
    }

    // Pass createdBy for duplicate check
    return await projectRepository.updateProject(projectId, projectName, description, project.created_by);
};
const addMember = async (projectId, userId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    // Project Manager can only manage their own projects
    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only manage members of projects you created');
    }

    return await projectRepository.addMember(projectId, userId);
};

const removeMember = async (projectId, userId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    // Project Manager can only manage their own projects
    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only manage members of projects you created');
    }

    const removed = await projectRepository.removeMember(projectId, userId);
    if (!removed) throw new Error('Member not found in this project');
    return removed;
};

const getProjectMembers = async (projectId, userId, userRole) => {
    const members = await projectRepository.getProjectMembers(projectId, userId, userRole);
    if (members === null) throw new Error('Project not found or access denied');
    return members;
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