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

// ✅ Dynamically Allow CORS for Local & Deployed Frontend
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ Fix preflight CORS errors

// Debugging: Ensure MONGODB_URI is loaded
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Set strictQuery to suppress deprecation warnings
mongoose.set('strictQuery', true);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout if unable to connect
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// ✅ Reset Fixed Tasks Daily (Runs at Midnight)
schedule.scheduleJob('0 0 * * *', async () => {
  try {
    await Task.updateMany({ isFixed: true }, { completed: false });
    console.log('🔄 Fixed tasks reset');
  } catch (err) {
    console.error('❌ Error resetting tasks:', err);
  }
});

// ✅ Initialize Fixed Tasks on Server Start
const initializeFixedTasks = async () => {
  try {
    const fixedTasksCount = await Task.countDocuments({ isFixed: true });
    if (fixedTasksCount === 0) {
      const fixedTasks = [
        { title: 'Morning Exercise', isFixed: true },
        { title: 'Read News', isFixed: true },
        { title: 'Daily Planning', isFixed: true },
      ];
      await Task.insertMany(fixedTasks);
      console.log('✅ Initialized fixed tasks');
    }
  } catch (err) {
    console.error('❌ Error initializing fixed tasks:', err);
  }
};
initializeFixedTasks();

// ✅ Serve Static Frontend Files (For Production)
const frontendPath = path.join(__dirname, 'build');
app.use(express.static(frontendPath));

// ✅ Handle React Routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ Start the Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
