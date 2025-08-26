import Admin from '../models/Admin.js';
import Agent from '../models/Agent.js';
import Task from '../models/Task.js';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

// Helper function to parse CSV data
const parseCSV = async (buffer) => {
  const records = [];
  const parser = parse({
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ',',
    relaxColumnCount: true
  });

  return new Promise((resolve, reject) => {
    parser.on('readable', function() {
      let record;
      while ((record = parser.read()) !== null) {
        // Create a structured record from the CSV data
        const [name, phone, ...notesParts] = Object.values(record)[0].split(',');
        records.push({
          firstName: name.trim(),
          phone: phone.trim(),
          notes: notesParts.join(',').trim()
        });

      }
    });

    parser.on('error', reject);
    parser.on('end', () => resolve(records));

    const stream = Readable.from([buffer]);
    stream.pipe(parser);
  });
};

export const createAgent = async (req, res) => {
  try {
    const { name, email, password, mobileNumber } = req.body;

    // Check if agent already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({ message: 'Agent already exists' });
    }

    // Create new agent
    const agent = await Agent.create({
      name,
      email,
      password,
      mobileNumber,
      admin: req.user._id
    });

    res.status(201).json({
      success: true,
      data: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        mobileNumber: agent.mobileNumber
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating agent', error: error.message });
  }
};

export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ admin: req.user._id })
      .select('-password')
      .populate('tasks');
    
    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching agents', error: error.message });
  }
};

export const uploadAndDistributeTasks = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Parse agent IDs from request body
    let agentIds = [];
    try {
      agentIds = JSON.parse(req.body.agentIds || '[]');
    } catch (error) {
      return res.status(400).json({ message: 'Invalid agent IDs format' });
    }

    if (agentIds.length === 0) {
      return res.status(400).json({ message: 'No agents selected for distribution' });
    }

    // Get agents for this admin
    const agents = await Agent.find({
      _id: { $in: agentIds },
      admin: req.user._id
    });

    if (agents.length === 0) {
      return res.status(400).json({ message: 'No valid agents found to distribute tasks' });
    }

    // Parse CSV file
    let records;
    try {
      records = await parseCSV(req.file.buffer);
    } catch (error) {
      return res.status(400).json({ message: 'Error parsing CSV file', error: error.message });
    }

    if (records.length === 0) {
      return res.status(400).json({ message: 'No valid records found in the file' });
    }

    // Calculate tasks per agent before creation
    const tasksPerAgent = Math.floor(records.length / agents.length);
    const remainingTasks = records.length % agents.length;

    // Create tasks with pre-assigned agents
    const taskDocs = [];
    let currentIndex = 0;
    
    for (let i = 0; i < agents.length && currentIndex < records.length; i++) {
      const agent = agents[i];
      const numberOfTasks = i < remainingTasks ? tasksPerAgent + 1 : tasksPerAgent;
      
      for (let j = 0; j < numberOfTasks && currentIndex < records.length; j++) {
        const record = records[currentIndex++];
        taskDocs.push({
          firstName: record.firstName,
          phone: record.phone,
          notes: record.notes,
          assignedBy: req.user._id,
          assignedByModel: 'Admin',
          status: 'pending',
          assignedTo: agent._id,
          assignedToModel: 'Agent'
        });
      }
    }

    // Validate data before insertion
    const invalidRecords = taskDocs.filter(doc => !doc.firstName || !doc.phone);
    if (invalidRecords.length > 0) {
      return res.status(400).json({
        message: 'Invalid records found',
        invalidRecords
      });
    }

    const createdTasks = await Task.insertMany(taskDocs);

    // Group tasks by agent
    const tasksByAgent = createdTasks.reduce((acc, task) => {
      const agentId = task.assignedTo.toString();
      if (!acc.has(agentId)) {
        acc.set(agentId, []);
      }
      acc.get(agentId).push(task._id);
      return acc;
    }, new Map());

    // Update agents with their tasks
    await Promise.all(
      Array.from(tasksByAgent.entries()).map(([agentId, taskIds]) =>
        Agent.findByIdAndUpdate(agentId, {
          $push: { tasks: { $each: taskIds } }
        })
      )
    );

    // Prepare the response
    const distribution = Array.from(tasksByAgent.entries()).map(([agentId, taskIds]) => {
      const agent = agents.find(a => a._id.toString() === agentId);
      return {
        agentId,
        agentName: agent.name,
        tasksAssigned: taskIds.length,
        tasks: taskIds
      };
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks: createdTasks.length,
        distribution
      }
    });
  } catch (error) {
    console.error('Error in uploadAndDistributeTasks:', error);
    res.status(500).json({
      message: 'Error processing and distributing tasks',
      error: error.message
    });
  }
};
