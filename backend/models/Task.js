import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['To-Do', 'In Progress', 'Done'], default: 'To-Do' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    // NAYA: Member ki progress reports ke liye
    updates: [{
        text: String,
        addedBy: { type: String }, // User ka naam save karenge
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);