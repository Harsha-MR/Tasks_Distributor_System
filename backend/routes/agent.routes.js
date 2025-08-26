import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createSubAgent,
  getSubAgents,
  getAssignedTasks,
  distributeTasksToSubAgents
} from '../controllers/agent.controller.js';

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);
router.use(authorize('agent'));

router.route('/sub-agents')
  .post(createSubAgent)
  .get(getSubAgents);

router.get('/tasks', getAssignedTasks);
router.post('/tasks/distribute', distributeTasksToSubAgents);

export default router;
