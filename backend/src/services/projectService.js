const projectRepository = require('../repositories/projectRepository');
const userRepository = require('../repositories/userRepository');

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

    // Project Managers can only add Collaborators to a project — Admins,
    // other Project Managers, etc. are added/managed at the user-account
    // level (Phase 3), not as project members. Admin is exempt from this
    // restriction (full access).
    if (userRole === 'Project Manager') {
        const targetUser = await userRepository.getUserById(userId);
        if (!targetUser) throw new Error('User not found or inactive');
        if (targetUser.role_name !== 'Collaborator') {
            throw new Error('Project Managers can only add Collaborators to a project');
        }
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

const archiveProject = async (projectId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    // Project Manager can only archive their own projects; Admin can archive any.
    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only archive projects you created');
    }
    if (project.is_archived) throw new Error('Project is already archived');

    return await projectRepository.setArchived(projectId, true);
};

const unarchiveProject = async (projectId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    if (userRole === 'Project Manager' && project.created_by !== requesterId) {
        throw new Error('You can only unarchive projects you created');
    }
    if (!project.is_archived) throw new Error('Project is not archived');

    return await projectRepository.setArchived(projectId, false);
};

const deleteProject = async (projectId, userRole) => {
    // Hard delete is Admin-only, by design — it permanently removes the
    // project and (via ON DELETE CASCADE) every task, comment, and
    // attachment tied to it. Project Managers get archive/unarchive
    // instead, which is reversible.
    if (userRole !== 'Admin') {
        throw new Error('Only an Administrator can permanently delete a project');
    }

    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    return await projectRepository.deleteProject(projectId);
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
    deleteProject
};