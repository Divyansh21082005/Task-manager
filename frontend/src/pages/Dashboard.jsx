import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';
import toast from 'react-hot-toast';
import { LayoutDashboard, LogOut, FolderKanban, Plus, CheckCircle2, Edit, MessageSquare, Send, Trash2, Users, Shield } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modals States
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false); // Naya: Team Modal
    
    // Data States
    const [allUsers, setAllUsers] = useState([]); 
    const [projectData, setProjectData] = useState({ name: '', description: '' });
    const [taskData, setTaskData] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
    const [editingTask, setEditingTask] = useState(null); 
    const [reportText, setReportText] = useState(''); 

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchTasks(selectedProject._id);
        }
    }, [selectedProject]);

    // Users ko fetch karne ka function alag kar diya taaki do jagah use ho sake
    const fetchUsers = async () => {
        try {
            const { data } = await API.get('/auth/users');
            setAllUsers(data);
        } catch (error) {
            console.error("Failed to load users");
        }
    };

    useEffect(() => {
        if (isTaskModalOpen || isTeamModalOpen) fetchUsers();
    }, [isTaskModalOpen, isTeamModalOpen]);

    const fetchProjects = async () => {
        try {
            const { data } = await API.get('/projects');
            setProjects(data);
            if (data.length > 0) setSelectedProject(data[0]);
        } catch (error) {
            toast.error("Failed to load projects");
        }
    };

    const fetchTasks = async (projectId) => {
        setLoading(true);
        try {
            const { data } = await API.get(`/tasks/${projectId}`);
            setTasks(data);
        } catch (error) {
            toast.error("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await API.put(`/tasks/${taskId}`, { status: newStatus });
            toast.success("Task updated!");
            fetchTasks(selectedProject._id);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await API.post('/projects', projectData);
            toast.success("Project created!");
            setIsProjectModalOpen(false);
            setProjectData({ name: '', description: '' }); 
            fetchProjects();
        } catch (error) {
            toast.error("Failed to create project");
        }
    };

    const handleDeleteProject = async (projectId, e) => {
        e.stopPropagation(); 
        if(window.confirm("Are you sure? This will delete the project and all its tasks!")) {
            try {
                await API.delete(`/projects/${projectId}`);
                toast.success("Project deleted successfully");
                if(selectedProject?._id === projectId) {
                    setSelectedProject(null);
                    setTasks([]);
                }
                fetchProjects();
            } catch (error) {
                toast.error("Failed to delete project");
            }
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', { ...taskData, project: selectedProject._id });
            toast.success("Task assigned!");
            setIsTaskModalOpen(false);
            setTaskData({ title: '', description: '', assignedTo: '', dueDate: '' }); 
            fetchTasks(selectedProject._id);
        } catch (error) {
            toast.error("Failed to assign task");
        }
    };

    const handleEditTaskSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/tasks/${editingTask._id}/edit`, editingTask);
            toast.success("Task details updated!");
            setIsEditModalOpen(false);
            fetchTasks(selectedProject._id);
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const handleAddReport = async (taskId) => {
        if(!reportText.trim()) return;
        try {
            await API.post(`/tasks/${taskId}/updates`, { text: reportText, addedBy: user.name });
            toast.success("Progress reported!");
            setReportText(''); 
            fetchTasks(selectedProject._id);
        } catch (error) {
            toast.error("Failed to add report");
        }
    };

    // --- NAYE FUNCTIONS: Team Management ---
    const handleDeleteUser = async (userId) => {
        if(window.confirm("Remove this user from the company?")) {
            try {
                await API.delete(`/auth/users/${userId}`);
                toast.success("User removed successfully");
                fetchUsers(); // List update karein
            } catch (error) {
                toast.error("Failed to remove user");
            }
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await API.put(`/auth/users/${userId}/role`, { role: newRole });
            toast.success("User role updated!");
            fetchUsers(); // List update karein
        } catch (error) {
            toast.error("Failed to update role");
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Done': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <LayoutDashboard className="text-white w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Task Manager</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                            {user?.role}
                        </p>
                    </div>
                    
                    {/* NAYA: Manage Team Button (Sirf Admin) */}
                    {user?.role === 'Admin' && (
                        <button 
                            onClick={() => setIsTeamModalOpen(true)} 
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                            title="Manage Team"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    )}

                    <button onClick={logout} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-all" title="Logout">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Pane: Projects List */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-[calc(100vh-8rem)]">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FolderKanban className="w-5 h-5 text-blue-600" /> Projects
                        </h2>
                        {user?.role === 'Admin' && (
                            <button 
                                onClick={() => setIsProjectModalOpen(true)} 
                                className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 transition"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <div className="overflow-y-auto flex-1 space-y-2 pr-2">
                        {projects.length === 0 ? (
                            <p className="text-gray-400 text-sm text-center mt-10">No projects found.</p>
                        ) : (
                            projects.map((project) => (
                                <div 
                                    key={project._id}
                                    onClick={() => setSelectedProject(project)}
                                    className={`p-3 rounded-xl cursor-pointer transition-all border group ${
                                        selectedProject?._id === project._id 
                                        ? 'bg-blue-50 border-blue-200' 
                                        : 'bg-white border-gray-100 hover:border-blue-100 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{project.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{project.description}</p>
                                        </div>
                                        {user?.role === 'Admin' && (
                                            <button 
                                                onClick={(e) => handleDeleteProject(project._id, e)}
                                                className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                                title="Delete Project"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: Tasks List */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col h-[calc(100vh-8rem)]">
                    {selectedProject ? (
                        <>
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedProject.name} Tasks</h2>
                                    <p className="text-sm text-gray-500 mt-1">Manage and track progress</p>
                                </div>
                                {user?.role === 'Admin' && (
                                    <button 
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Plus className="w-4 h-4" /> Assign Task
                                    </button>
                                )}
                            </div>

                            {/* Analytics Summary Cards */}
                            {tasks.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                        <p className="text-blue-600 text-sm font-semibold">Total Tasks</p>
                                        <p className="text-2xl font-bold text-blue-800">{totalTasks}</p>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl">
                                        <p className="text-yellow-600 text-sm font-semibold">In Progress</p>
                                        <p className="text-2xl font-bold text-yellow-800">{inProgressTasks}</p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl">
                                        <p className="text-green-600 text-sm font-semibold">Completed</p>
                                        <p className="text-2xl font-bold text-green-800">{completedTasks}</p>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-y-auto flex-1 space-y-3 pr-2">
                                {loading ? (
                                    <p className="text-center text-gray-400 mt-10">Loading tasks...</p>
                                ) : tasks.length === 0 ? (
                                    <div className="text-center mt-20">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">No tasks assigned yet.</p>
                                    </div>
                                ) : (
                                    tasks.map((task) => (
                                        <div key={task._id} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-gray-50 flex flex-col gap-4">
                                            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
                                                        {user.role === 'Admin' && (
                                                            <button 
                                                                onClick={() => { setEditingTask(task); setIsEditModalOpen(true); }} 
                                                                className="text-gray-400 hover:text-blue-600 transition"
                                                                title="Edit Task"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-3">
                                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(task.status)}`}>
                                                            {task.status}
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200">
                                                            Assigned to: {task.assignedTo?.name || 'Unknown'}
                                                        </span>
                                                        {task.dueDate && (
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-md border ${
                                                                new Date(task.dueDate) < new Date() && task.status !== 'Done' 
                                                                ? 'bg-red-50 text-red-600 border-red-200' 
                                                                : 'bg-white text-gray-500 border-gray-200'
                                                            }`}>
                                                                🗓️ Due: {new Date(task.dueDate).toLocaleDateString()}
                                                                {(new Date(task.dueDate) < new Date() && task.status !== 'Done') && ' ⚠️ Overdue'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {(user.role === 'Admin' || task.assignedTo?._id === user._id) && (
                                                    <select 
                                                        value={task.status}
                                                        onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                                        className="text-sm border border-gray-300 text-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 bg-white outline-none cursor-pointer h-fit"
                                                    >
                                                        <option value="To-Do">To-Do</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                    </select>
                                                )}
                                            </div>

                                            <div className="mt-2 pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                                    <MessageSquare className="w-4 h-4" /> Progress Updates
                                                </div>
                                                
                                                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto pr-2">
                                                    {task.updates?.length > 0 ? (
                                                        task.updates.map((upd, i) => (
                                                            <div key={i} className="bg-white p-2 rounded-lg border border-gray-100 text-sm shadow-sm">
                                                                <span className="font-semibold text-blue-600">{upd.addedBy}: </span>
                                                                <span className="text-gray-600">{upd.text}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">No updates yet.</p>
                                                    )}
                                                </div>

                                                {(user.role === 'Admin' || task.assignedTo?._id === user._id) && (
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Add a progress report..." 
                                                            value={reportText}
                                                            onChange={(e) => setReportText(e.target.value)}
                                                            className="flex-1 text-sm p-2 border rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                                                        />
                                                        <button 
                                                            onClick={() => handleAddReport(task._id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
                                                        >
                                                            <Send className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <FolderKanban className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select a project from the left panel to view tasks.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- TEAM MANAGEMENT MODAL --- */}
            {isTeamModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                                <Shield className="w-6 h-6 text-blue-600"/> Manage Team
                            </h2>
                            <button onClick={() => setIsTeamModalOpen(false)} className="text-gray-400 hover:text-gray-800 text-2xl leading-none">&times;</button>
                        </div>
                        <div className="overflow-y-auto pr-2 space-y-3 flex-1">
                            {allUsers.map(u => (
                                <div key={u._id} className="flex flex-wrap items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:border-blue-100 transition">
                                    <div className="mb-2 sm:mb-0">
                                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                                            {u.name} {u._id === user._id && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">You</span>}
                                        </p>
                                        <p className="text-xs text-gray-500">{u.email}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select 
                                            value={u.role} 
                                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                            disabled={u._id === user._id} // Admin khud ka role change na kare
                                            className="text-sm border border-gray-300 p-1.5 rounded outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                                        >
                                            <option value="Member">Member</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                        <button 
                                            onClick={() => handleDeleteUser(u._id)}
                                            disabled={u._id === user._id} // Admin khud ko delete na kare
                                            className={`p-1.5 rounded transition ${u._id === user._id ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                                            title="Remove User"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- CREATE PROJECT MODAL --- */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <input type="text" placeholder="Project Name" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={projectData.name} onChange={(e) => setProjectData({...projectData, name: e.target.value})} />
                            <textarea placeholder="Description" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={projectData.description} onChange={(e) => setProjectData({...projectData, description: e.target.value})} />
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- ASSIGN TASK MODAL --- */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Assign Task to Team</h2>
                        <form onSubmit={handleAssignTask} className="space-y-4">
                            <input type="text" placeholder="Task Title" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={taskData.title} onChange={(e) => setTaskData({...taskData, title: e.target.value})} />
                            <textarea placeholder="Task Description" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})} />
                            
                            <select required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={taskData.assignedTo} onChange={(e) => setTaskData({...taskData, assignedTo: e.target.value})}>
                                <option value="">Select Member</option>
                                {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                            </select>

                            <input type="date" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={taskData.dueDate} onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})} />

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- EDIT TASK MODAL (Only Admin) --- */}
            {isEditModalOpen && editingTask && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Edit Task</h2>
                        <form onSubmit={handleEditTaskSubmit} className="space-y-4">
                            <input type="text" required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingTask.title} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} />
                            <textarea required className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingTask.description} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} />
                            
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-2 text-gray-600 font-medium">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;