const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const schedule = require('node-schedule');
const Task = require('./models/Task');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Set strictQuery to true to suppress the deprecation warning and maintain current behavior
mongoose.set('strictQuery', true);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB (todo_list database)'))
  .catch(err => console.error('MongoDB connection error:', err));

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Reset fixed tasks every day at midnight
schedule.scheduleJob('0 0 * * *', async () => {
  try {
    await Task.updateMany(
      { isFixed: true },
      { completed: false }
    );
    console.log('Fixed tasks reset');
  } catch (err) {
    console.error('Error resetting tasks:', err);
  }
});

// Initialize fixed tasks on server start if none exist
const initializeFixedTasks = async () => {
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
};

initializeFixedTasks();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});