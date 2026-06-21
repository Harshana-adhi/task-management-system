const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const {
    createProjectSchema,
    updateProjectSchema,
    addMemberSchema
} = require('../validators/projectValidator');

// Create project
router.post('/', authenticate, authorize('Admin', 'Project Manager'), validate(createProjectSchema), projectController.createProject);

// View all projects
router.get('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getAllProjects);

// View single project
router.get('/:projectId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getProjectById);

// Update project
router.put('/:projectId', authenticate, authorize('Admin', 'Project Manager'), validate(updateProjectSchema), projectController.updateProject);

// Add member
router.post('/:projectId/members', authenticate, authorize('Admin', 'Project Manager'), validate(addMemberSchema), projectController.addMember);

// Remove member
router.delete('/:projectId/members/:userId', authenticate, authorize('Admin', 'Project Manager'), projectController.removeMember);

// View members
router.get('/:projectId/members', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getProjectMembers);

// Archive project (Admin + Project Manager, own projects only for PM) — reversible
router.patch('/:projectId/archive', authenticate, authorize('Admin', 'Project Manager'), projectController.archiveProject);

// Unarchive project (Admin + Project Manager, own projects only for PM)
router.patch('/:projectId/unarchive', authenticate, authorize('Admin', 'Project Manager'), projectController.unarchiveProject);

// Permanently delete project (Admin only) — irreversible, cascades to tasks/comments/attachments
router.delete('/:projectId', authenticate, authorize('Admin'), projectController.deleteProject);

module.exports = router;