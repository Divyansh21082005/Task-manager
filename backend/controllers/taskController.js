import Task from '../models/Task.js';
import Project from '../models/Project.js';



export const createTask = async (req, res) => {
    const { title, description, project, assignedTo, dueDate } = req.body;

    try {
        const task = await Task.create({
            title, description, project, assignedTo, dueDate
        });

        // NAYI LINE: Jaise hi task assign ho, us member ko Project mein bhi add kar do 
        await Project.findByIdAndUpdate(project, {
            $addToSet: { members: assignedTo }
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Get Tasks kisi specific project ke liye
export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ project: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('project', 'name');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Task Status (Member ya Admin)
export const updateTaskStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        // Security Check: Sirf Admin ya jisko task assign hua hai wahi status change kar sake
        if (req.user.role !== 'Admin' && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this task" });
        }

        task.status = status;
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Admin ke liye: Task Edit karna
export const editTask = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Member ke liye: Progress Report/Update dalna
export const addTaskUpdate = async (req, res) => {
    const { id } = req.params;
    const { text, addedBy } = req.body;
    try {
        const task = await Task.findById(id);
        task.updates.push({ text, addedBy });
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};