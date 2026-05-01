import express from 'express';
import { createProject, getProjects, deleteProject } from '../controllers/projectController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// protect = login zaroori hai, admin = sirf admin permission
router.post('/', protect, admin, createProject); 
router.get('/', protect, getProjects);
router.delete('/:id', protect, admin, deleteProject);

export default router;