import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
// Yeh do nayi lines add karein
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());
app.use(cors({ origin: '*' }));
app.get('/', (req, res) => {
    res.send("Hello Isha! Backend is officially ALIVE and working!");
});

// Routes
app.use('/api/auth', authRoutes);
// Yeh do nayi lines add karein
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('Ethara Task Manager API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {   // <-- '0.0.0.0' lagana zaroori hai
  console.log(`Server running on port ${PORT}`);
});