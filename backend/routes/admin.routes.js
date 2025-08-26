import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createAgent, getAgents, uploadAndDistributeTasks, getAgentTasks } from '../controllers/admin.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect all routes after this middleware
router.use(protect);
router.use(authorize('admin'));

router.route('/agents')
  .post(createAgent)
  .get(getAgents);

router.get('/agents/:agentId/tasks', getAgentTasks);

router.post('/tasks/distribute', upload.single('file'), uploadAndDistributeTasks);

export default router;
