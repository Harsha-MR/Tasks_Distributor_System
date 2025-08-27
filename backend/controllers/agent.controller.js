import SubAgent from '../models/SubAgent.js';
import Task from '../models/Task.js';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

export const createSubAgent = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    // Check if sub-agent already exists
    const existingSubAgent = await SubAgent.findOne({ email });
    if (existingSubAgent) {
      return res.status(400).json({ message: 'Sub-agent already exists' });
    }

    // Create new sub-agent
    const subAgent = await SubAgent.create({
      name,
      email,
      password,
      mobileNumber,
      agent: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        id: subAgent._id,
        name: subAgent.name,
        email: subAgent.email,
        mobileNumber: subAgent.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating sub-agent', error: error.message });
  }
};

export const getSubAgents = async (req, res) => {
  try {
    const subAgents = await SubAgent.find({ agent: req.user._id })
      .select('-password')
      .populate('tasks');
    
    res.status(200).json({
      success: true,
      data: subAgents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sub-agents', error: error.message });
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      assignedToModel: 'Agent'
    });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
};

export const distributeTasksToSubAgents = async (req, res) => {
  try {
    const { distribution } = req.body;

    if (!distribution || typeof distribution !== 'object') {
      return res.status(400).json({ message: 'Invalid distribution format' });
    }

    // Get all task IDs from the distribution
    const allTaskIds = Object.values(distribution).flat();
    const subAgentIds = Object.keys(distribution);

    // Verify tasks belong to the agent
    const tasks = await Task.find({
      _id: { $in: allTaskIds },
      assignedTo: req.user._id,
      assignedToModel: 'Agent'
    });

    if (tasks.length !== allTaskIds.length) {
      return res.status(400).json({ message: 'Invalid task IDs or unauthorized access' });
    }

    // Verify sub-agents belong to the agent
    const subAgents = await SubAgent.find({
      _id: { $in: subAgentIds },
      agent: req.user._id
    });

    if (subAgents.length === 0) {
      return res.status(400).json({ message: 'No valid sub-agents found' });
    }

    // Create updates for tasks
    const updates = [];

    for (const [subAgentId, taskIds] of Object.entries(distribution)) {
      taskIds.forEach(taskId => {
        updates.push({
          updateOne: {
            filter: { _id: taskId },
            update: {
              assignedTo: subAgentId,
              assignedToModel: 'SubAgent'
            }
          }
        });
      });
    }

    await Task.bulkWrite(updates);

    // Update sub-agents with their tasks
    const updatedTasks = await Task.find({ _id: { $in: allTaskIds } });
    const taskMap = updatedTasks.reduce((acc, task) => {
      if (!acc[task.assignedTo]) {
        acc[task.assignedTo] = [];
      }
      acc[task.assignedTo].push(task._id);
      return acc;
    }, {});

    await Promise.all(
      Object.entries(taskMap).map(([subAgentId, taskIds]) =>
        SubAgent.findByIdAndUpdate(subAgentId, {
          $push: { tasks: { $each: taskIds } }
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Tasks distributed successfully',
      data: {
        totalTasks: tasks.length,
        distribution: Object.entries(taskMap).map(([subAgentId, tasks]) => ({
          subAgentId,
          tasksAssigned: tasks.length
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error distributing tasks', error: error.message });
  }
};
