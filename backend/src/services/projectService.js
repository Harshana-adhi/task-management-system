const projectRepository = require('../repositories/projectRepository');

const createProject = async (projectName, description, createdBy) => {
    return await projectRepository.createProject(projectName, description, createdBy);
};

const getAllProjects = async () => {
    return await projectRepository.getAllProjects();
};

const getProjectById = async (projectId) => {
    const project = await projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    return project;
};

const updateProject = async (projectId, projectName, description, userId, userRole) => {
    const project = await projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    if (userRole === 'Project Manager' && project.created_by !== userId) {
        throw new Error('You can only update projects you created');
    }

    return await projectRepository.updateProject(projectId, projectName, description);
};

const addMember = async (projectId, userId, requesterId, userRole) => {
    const project = await projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only manage members of projects you created');
    }

    return await projectRepository.addMember(projectId, userId);
};

const removeMember = async (projectId, userId, requesterId, userRole) => {
    const project = await projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only manage members of projects you created');
    }

    const removed = await projectRepository.removeMember(projectId, userId);
    if (!removed) throw new Error('Member not found in this project');
    return removed;
};

const getProjectMembers = async (projectId) => {
    const project = await projectRepository.getProjectById(projectId);
    if (!project) throw new Error('Project not found');
    return await projectRepository.getProjectMembers(projectId);
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