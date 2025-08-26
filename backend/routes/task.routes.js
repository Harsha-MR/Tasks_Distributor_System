import express from 'express';
import { protect } from '../middleware/auth.js';
import Task from '../models/Task.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to view this task
    const isAuthorized = 
      (req.user.role === 'admin' && task.assignedByModel === 'Admin' && task.assignedBy.toString() === req.user._id.toString()) ||
      (req.user.role === 'agent' && task.assignedTo.toString() === req.user._id.toString()) ||
      (req.user.role === 'sub-agent' && task.assignedTo.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error: error.message });
  }
});

// Update task status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update this task
    const isAuthorized = 
      (req.user.role === 'agent' && task.assignedTo.toString() === req.user._id.toString()) ||
      (req.user.role === 'sub-agent' && task.assignedTo.toString() === req.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

// Distribute tasks among agents
router.post('/distribute', async (req, res) => {
  try {
    const { tasks, agentIds } = req.body;

    // Validate input
    if (!tasks || !Array.isArray(tasks) || !agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({ message: 'Please provide tasks and agent IDs arrays' });
    }

    if (tasks.length === 0 || agentIds.length === 0) {
      return res.status(400).json({ message: 'Tasks and agents arrays cannot be empty' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can distribute tasks' });
    }

    // Calculate distribution
    const tasksPerAgent = Math.floor(tasks.length / agentIds.length);
    const remainingTasks = tasks.length % agentIds.length;
    
    // Create distribution map
    const distribution = {};
    let taskIndex = 0;

    for (let i = 0; i < agentIds.length; i++) {
      const agentId = agentIds[i];
      const agentTasks = [];
      
      // Assign base number of tasks
      for (let j = 0; j < tasksPerAgent; j++) {
        if (taskIndex < tasks.length) {
          agentTasks.push(tasks[taskIndex++]);
        }
      }
      
      // Distribute remaining tasks sequentially
      if (i < remainingTasks && taskIndex < tasks.length) {
        agentTasks.push(tasks[taskIndex++]);
      }
      
      distribution[agentId] = agentTasks;
    }

    // Save task assignments to database
    const updates = [];
    for (const [agentId, agentTasks] of Object.entries(distribution)) {
      for (const task of agentTasks) {
        updates.push({
          updateOne: {
            filter: { _id: task._id || task },
            update: {
              $set: {
                assignedTo: agentId,
                assignedBy: req.user._id,
                assignedToModel: 'Agent',
                assignedByModel: 'Admin',
                assignedAt: new Date(),
                status: 'pending'
              }
            }
          }
        });
      }
    }

    // Execute all updates in a bulk operation
    if (updates.length > 0) {
      await Task.bulkWrite(updates);
    }

    // Return the distribution summary
    res.status(200).json({
      success: true,
      data: {
        totalTasks: tasks.length,
        distribution: Object.entries(distribution).map(([agentId, tasks]) => ({
          agentId,
          tasksAssigned: tasks.length,
          tasks: tasks
        }))
      }
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error distributing tasks', 
      error: error.message 
    });
  }
});

export default router;
