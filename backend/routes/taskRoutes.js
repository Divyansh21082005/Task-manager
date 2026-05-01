import express from 'express';
import { createTask, getTasks, updateTaskStatus, editTask, addTaskUpdate } from '../controllers/taskController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, admin, createTask); // Sirf admin task assign karega
router.get('/:projectId', protect, getTasks); // Sab dekh sakte hain apne project ke tasks
router.put('/:id', protect, updateTaskStatus); // Member/Admin status update kar sakte hain
router.put('/:id/edit', protect, admin, editTask); // Sirf Admin edit kar sakta hai
router.post('/:id/updates', protect, addTaskUpdate);

export default router;