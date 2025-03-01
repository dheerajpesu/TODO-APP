import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './components/TaskList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast
import Modal from 'react-modal'; // Import Modal from react-modal
import './App.css';

Modal.setAppElement('#root'); // Set the app element for accessibility

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const response = await axios.get('http://localhost:5000/api/tasks');
    setTasks(response.data);
  };

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    openModal();
  };

  const handleTaskType = async (fixed) => {
    setIsFixed(fixed);
    try {
      await axios.post('http://localhost:5000/api/tasks', {
        title: newTask,
        isFixed: fixed
      });
      const taskType = fixed ? 'Fixed' : 'Variable';
      toast.success(`Task "${newTask}" added as a ${taskType} Task!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setNewTask('');
      closeModal();
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error('Failed to add task. Please try again.', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  return (
    <div className="App">
      <h1>TODO App</h1>
      
      <form onSubmit={addTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add Task</button>
      </form>

      <ToastContainer /> {/* Add ToastContainer to render toasts */}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Select Task Type"
        className="modal"
      >
        <h2>Select Task Type</h2>
        <button onClick={() => handleTaskType(true)}>Fixed Task (Resets Daily)</button>
        <button onClick={() => handleTaskType(false)}>Variable Task</button>
        <button onClick={closeModal}>Cancel</button>
      </Modal>

      <TaskList tasks={tasks} fetchTasks={fetchTasks} />
    </div>
  );
}

export default App;