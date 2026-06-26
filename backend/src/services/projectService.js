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

// A Project Manager can act on a project if:
//   - they are the assigned_manager (always takes precedence), OR
//   - they created it AND their owner rights haven't been revoked by an Admin
// Admin can always manage any project.
const canManageProject = (project, requesterId, userRole) => {
    if (userRole === 'Admin') return true;
    if (userRole !== 'Project Manager') return false;
    if (project.assigned_manager_id === requesterId) return true;
    return project.created_by === requesterId && !project.owner_revoked;
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

    const targetUser = await userRepository.getUserById(userId);
    if (!targetUser) throw new Error('User not found or inactive');

    // Admin accounts are never project members — Admin oversight works at
    // the account level (full visibility into every project already),
    // not via project_members rows. This applies regardless of who's
    // adding, so it's checked before the PM-specific rule below.
    if (targetUser.role_name === 'Admin') {
        throw new Error('Admin accounts cannot be added as project members');
    }

    // The project's effective manager (assigned, or the original PM
    // creator if their rights haven't been revoked) already has full
    // management rights over the project — adding them as a regular
    // member too is redundant and not allowed.
    const isEffectiveManager = project.assigned_manager_id === userId
        || (project.created_by === userId && project.created_by_role === 'Project Manager' && !project.owner_revoked);
    if (isEffectiveManager) {
        throw new Error('This user already manages the project and cannot also be added as a member');
    }

    // Project Managers can only add Collaborators to a project — other
    // Project Managers are added/managed at the user-account level
    // (Phase 3), not as project members here. Admin is exempt from this
    // specific restriction and can add either a PM or a Collaborator —
    // a PM can be a regular member of a project they don't manage.
    if (userRole === 'Project Manager' && targetUser.role_name !== 'Collaborator') {
        throw new Error('Project Managers can only add Collaborators to a project');
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

// Assign one Project Manager to manage a project — Admin only.
// Overwrites any previously assigned manager (a project can only have
// one at a time), and supersedes the original creator's rights too —
// this covers the practical scenario where an Admin needs to hand a
// PM-created project to a different Project Manager entirely (e.g. the
// original PM left the team). The target user must actually hold the
// Project Manager role.
const assignManager = async (projectId, userId, requesterRole) => {
    if (requesterRole !== 'Admin') {
        throw new Error('Only an Administrator can assign a project manager');
    }

    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

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

// Unassigns whoever currently manages this project — whether that's a
// previously assigned co-manager, OR the original creator (if they're a
// PM with active rights). Either way, the project is left with no
// manager until the Admin assigns a new one (see setAssignedManager /
// removeAssignedManager — both set owner_revoked = true).
const unassignManager = async (projectId, requesterRole) => {
    if (requesterRole !== 'Admin') {
        throw new Error('Only an Administrator can unassign a project manager');
    }

    const project = await projectRepository.getProjectByIdInternal(projectId);
    if (!project) throw new Error('Project not found');

    const hasAssignedManager = !!project.assigned_manager_id;
    const ownerHasActiveRights = project.created_by_role === 'Project Manager' && !project.owner_revoked;

    if (!hasAssignedManager && !ownerHasActiveRights) {
        throw new Error('This project has no manager to unassign');
    }

    // Whoever effectively manages it right now — this is who gets notified.
    const previousManagerId = project.assigned_manager_id || project.created_by;

    const updatedProject = await projectRepository.removeAssignedManager(projectId);
    return { project: updatedProject, previousManagerId };
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