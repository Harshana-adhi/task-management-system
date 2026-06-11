const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { verifyToken } = require('../middleware/authMiddleware');

// All project routes require authentication
router.use(verifyToken);

// Project CRUD
router.post('/', projectController.createProject);           // Create project
router.get('/', projectController.getAllProjects);            // View all projects
router.get('/:projectId', projectController.getProjectById); // View single project
router.put('/:projectId', projectController.updateProject);  // Update project

// Project Members
router.post('/:projectId/members', projectController.addMember);         // Add member
router.get('/:projectId/members', projectController.getProjectMembers);  // View members

module.exports = router;
