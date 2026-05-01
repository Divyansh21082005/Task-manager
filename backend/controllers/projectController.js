import Project from '../models/Project.js';
import Task from '../models/Task.js';


export const createProject = async (req, res) => {
    const { name, description, members } = req.body;

    try {
        const project = await Project.create({
            name,
            description,
            createdBy: req.user._id, 
            members
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getProjects = async (req, res) => {
    try {
        let projects;
        if (req.user.role === 'Admin') {
            
            projects = await Project.find().populate('members', 'name email');
        } else {
            
            projects = await Project.find({ members: req.user._id }).populate('members', 'name email');
        }
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        
        await Task.deleteMany({ project: id });

    
        await Project.findByIdAndDelete(id);

        res.status(200).json({ message: "Project and its tasks deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};