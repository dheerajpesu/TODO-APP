import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Import toast from react-toastify

function TaskList({ tasks, fetchTasks }) {
  const toggleTask = async (task) => {
    await axios.patch(`http://localhost:5000/api/tasks/${task._id}`, {
      completed: !task.completed
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskToDelete = tasks.find(task => task._id === id);
      const taskType = taskToDelete.isFixed ? 'Fixed' : 'Variable';
      try {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`);
        toast.success(`"${taskToDelete.title}" (${taskType} Task) deleted successfully!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        fetchTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        toast.error('Failed to delete task. Please try again.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const fixedTasks = tasks.filter(task => task.isFixed);
  const variableTasks = tasks.filter(task => !task.isFixed);

  return (
    <div>
      <h2>Fixed Tasks</h2>
      <ul>
        {fixedTasks.map(task => (
          <li key={task._id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>Variable Tasks</h2>
      <ul>
        {variableTasks.map(task => (
          <li key={task._id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            <button onClick={() => deleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;