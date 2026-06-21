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

// A Project Manager can manage a project if they created it OR were
// assigned to it by an Admin (see assignManager below) — both grant the
// same rights. Admin can always manage any project.
const canManageProject = (project, requesterId, userRole) => {
    if (userRole === 'Admin') return true;
    if (userRole !== 'Project Manager') return false;
    return project.created_by === requesterId || project.assigned_manager_id === requesterId;
};

const updateProject = async (projectId, projectName, description, userId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    if (!canManageProject(project, userId, userRole)) {
        throw new Error('You can only update projects you created or are assigned to manage');
    }

    // Pass createdBy for duplicate check
    return await projectRepository.updateProject(projectId, projectName, description, project.created_by);
};

const addMember = async (projectId, userId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    if (!canManageProject(project, requesterId, userRole)) {
        throw new Error('You can only manage members of projects you created or are assigned to manage');
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

    if (!canManageProject(project, requesterId, userRole)) {
        throw new Error('You can only manage members of projects you created or are assigned to manage');
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

    if (!canManageProject(project, requesterId, userRole)) {
        throw new Error('You can only archive projects you created or are assigned to manage');
    }
    if (project.is_archived) throw new Error('Project is already archived');

    return await projectRepository.setArchived(projectId, true);
};

const unarchiveProject = async (projectId, requesterId, userRole) => {
    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    if (!canManageProject(project, requesterId, userRole)) {
        throw new Error('You can only unarchive projects you created or are assigned to manage');
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

// Assign one Project Manager to "co-manage" a project — Admin only.
// Overwrites any previously assigned manager (a project can only have
// one at a time). The target user must actually hold the Project
// Manager role.
const assignManager = async (projectId, userId, requesterRole) => {
    if (requesterRole !== 'Admin') {
        throw new Error('Only an Administrator can assign a project manager');
    }

    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    // A project created by a Project Manager already has its leader —
    // no co-manager is needed. Assigning a manager only makes sense for
    // projects created by an Admin, which otherwise have no PM at all.
    if (project.created_by_role === 'Project Manager') {
        throw new Error('This project was created by a Project Manager and already has a manager — no co-manager is needed');
    }

    const targetUser = await userRepository.getUserById(userId);
    if (!targetUser) throw new Error('User not found');
    if (targetUser.role_name !== 'Project Manager') {
        throw new Error('Only a user with the Project Manager role can be assigned to manage a project');
    }
    if (project.assigned_manager_id === userId) {
        throw new Error('This user is already the assigned manager for this project');
    }

    return await projectRepository.setAssignedManager(projectId, userId);
};

const unassignManager = async (projectId, requesterRole) => {
    if (requesterRole !== 'Admin') {
        throw new Error('Only an Administrator can unassign a project manager');
    }

    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');
    if (!project.assigned_manager_id) throw new Error('This project has no assigned manager');

    return await projectRepository.removeAssignedManager(projectId);
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
