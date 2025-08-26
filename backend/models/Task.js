import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel',
    required: true,
  },
  assignedToModel: {
    type: String,
    required: true,
    enum: ['Agent', 'SubAgent']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedByModel',
    required: true,
  },
  assignedByModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Agent']
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);
