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

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName]
 *             properties:
 *               projectName: { type: string, example: Website Redesign }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Project name is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: You already have a project with this name
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     summary: Get all projects visible to the current user
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate, authorize('Admin', 'Project Manager'), validate(createProjectSchema), projectController.createProject);
router.get('/', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project details
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update a project (creator or assigned manager only)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName]
 *             properties:
 *               projectName: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Project updated
 *       400:
 *         description: Project name is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not the creator or assigned manager
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: You already have a project with this name
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Permanently delete a project (Admin only) — cascades to tasks/comments/attachments
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project deleted permanently
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Only an Administrator can permanently delete a project
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:projectId', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getProjectById);
router.put('/:projectId', authenticate, authorize('Admin', 'Project Manager'), validate(updateProjectSchema), projectController.updateProject);
router.delete('/:projectId', authenticate, authorize('Admin'), projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{projectId}/members:
 *   post:
 *     summary: Add a member to a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Member added
 *       400:
 *         description: User ID is required
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not permitted to manage members, or PMs may only add Collaborators
 *       404:
 *         description: Project not found or user not found/inactive
 *       409:
 *         description: User is already a member of this project
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     summary: View members of a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: List of project members
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:projectId/members', authenticate, authorize('Admin', 'Project Manager'), validate(addMemberSchema), projectController.addMember);
router.get('/:projectId/members', authenticate, authorize('Admin', 'Project Manager', 'Collaborator'), projectController.getProjectMembers);

/**
 * @swagger
 * /api/projects/{projectId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Member removed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not permitted to manage members of this project
 *       404:
 *         description: Project or member not found
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:projectId/members/:userId', authenticate, authorize('Admin', 'Project Manager'), projectController.removeMember);

/**
 * @swagger
 * /api/projects/{projectId}/archive:
 *   patch:
 *     summary: Archive a project (reversible)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project archived
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not the creator or assigned manager
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Project is already archived
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:projectId/archive', authenticate, authorize('Admin', 'Project Manager'), projectController.archiveProject);

/**
 * @swagger
 * /api/projects/{projectId}/unarchive:
 *   patch:
 *     summary: Unarchive a project
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Project unarchived
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Not the creator or assigned manager
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Project is not archived
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:projectId/unarchive', authenticate, authorize('Admin', 'Project Manager'), projectController.unarchiveProject);

/**
 * @swagger
 * /api/projects/{projectId}/manager:
 *   patch:
 *     summary: Assign a Project Manager to manage this project (Admin only) — supersedes whoever currently manages it, including the original creator
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Manager assigned
 *       400:
 *         description: Target user is not a Project Manager
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Only an Administrator can assign a project manager
 *       404:
 *         description: Project or user not found
 *       409:
 *         description: User is already the assigned manager for this project
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     summary: Unassign whoever currently manages a project (Admin only) — including the original PM creator, if applicable
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Manager unassigned
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Only an Administrator can unassign a project manager
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: This project has no manager to unassign
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:projectId/manager', authenticate, authorize('Admin'), projectController.assignManager);
router.delete('/:projectId/manager', authenticate, authorize('Admin'), projectController.unassignManager);

module.exports = router;