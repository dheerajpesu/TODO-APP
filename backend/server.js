const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const schedule = require('node-schedule');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());

// ✅ Allow CORS for both local & production frontend
const corsOptions = {
  origin: ['http://localhost:3000', 'https://todo-app-1-kzxh.onrender.com'], // Allow local & deployed frontend
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Fix preflight CORS errors

// Debugging: Ensure MONGODB_URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Set strictQuery to suppress deprecation warnings
mongoose.set('strictQuery', true);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout if unable to connect
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// ✅ Reset fixed tasks every day at midnight
schedule.scheduleJob('0 0 * * *', async () => {
  try {
    await Task.updateMany({ isFixed: true }, { completed: false });
    console.log('Fixed tasks reset');
  } catch (err) {
    console.error('Error resetting tasks:', err);
  }
});

// ✅ Initialize fixed tasks on server start if none exist
const initializeFixedTasks = async () => {
  try {
    const fixedTasksCount = await Task.countDocuments({ isFixed: true });
    if (fixedTasksCount === 0) {
      const fixedTasks = [
        { title: 'Morning Exercise', isFixed: true },
        { title: 'Read News', isFixed: true },
        { title: 'Daily Planning', isFixed: true }
      ];
      await Task.insertMany(fixedTasks);
      console.log('Initialized fixed tasks');
    }
  } catch (err) {
    console.error('Error initializing fixed tasks:', err);
  }
};
initializeFixedTasks();

// ✅ Serve static frontend files (for production)
const frontendPath = path.join(__dirname, 'build');
app.use(express.static(frontendPath));

// ✅ Handle React routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
