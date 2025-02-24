import { useState, useEffect } from 'react';
import { Column } from './Column';
import { DndContext } from '@dnd-kit/core';
import axios from 'axios';
import { io } from 'socket.io-client';
import SocialLogin from './shared/SocialLogin/SocialLogin';
import useAuth from './hooks/useAuth';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function App() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO' });

  const socket = io('http://localhost:5050', { transports: ['polling', 'websocket'] }); // Connect to the backend server

  // Fetch tasks when the component mounts
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await axios.get('http://localhost:5050/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }
    fetchTasks();

    // Listen for real-time task updates
    socket.on('taskUpdated', (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    socket.on('taskAdded', (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    return () => {
      socket.off('taskUpdated');
    };
  }, [socket]);

  // Handle drag and update task status
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Update task status via API
    async function updateTaskStatus() {
      try {
        await axios.patch(`http://localhost:5050/tasks/${taskId}`, {
          status: newStatus,
        });
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }

    updateTaskStatus();
  }

  // Add a new task
  async function addNewTask(e) {
    e.preventDefault();
    if (!newTask.title || !newTask.description) return;

    try {
      const response = await axios.post('http://localhost:5050/tasks', newTask);
      setNewTask({ title: '', description: '', status: 'TODO' }); // Clear form after submission
      console.log('New task added:', response.data
      );
    } catch (error) {
      console.error('Error adding new task:', error);
    }
  }

  // Handle input change for new task
  function handleInputChange(e) {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  }

  return (
    <div className="flex flex-col bg-black min-h-screen text-white">
      <div className="flex items-center px-2 justify-between bg-gray-700">
        <div className="flex justify-center">
          <h1>TODOs</h1>
        </div>
        <div className="py-2">
          <h1 className="text-3xl font-semibold text-center">Efficiento</h1>
          <p className="text-center text-gray-500">Your Efficient Task Manager</p>
        </div>
        <div>
          {user ? (
            <div className="flex gap-2">
              <img className="w-10 h-10 rounded-full ring-2" src={user?.photoURL} alt="" />
              <button className="btn bg-red-500 py-1 px-5 rounded-2xl text-center text-white">
                Log Out
              </button>
            </div>
          ) : (
            <SocialLogin />
          )}
        </div>
      </div>

      {/* Task Creation Form */}
      <div className="mb-8 w-11/12 md:w-10/12 lg:w-8/12 mx-auto">
        <h2 className="text-xl font-semibold text-black">Add New Task</h2>
        <form onSubmit={addNewTask} className="flex flex-col gap-4 bg-neutral-800 p-4 rounded-lg mt-4">
          <input
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Task Title"
            className="input input-bordered w-full rounded-xl p-1 bg-neutral-700 text-neutral-100"
          />
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Task Description"
            className="textarea textarea-bordered rounded-xl p-1 w-full bg-neutral-700 text-neutral-100"
          />
          <button type="submit" className="btn bg-blue-500 py-1 px-5 rounded-2xl text-neutral-100">
            Add Task
          </button>
        </form>
      </div>

      {/* Task Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 w-11/12 mx-auto flex-wrap gap-8">
        <DndContext onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => (
            <Column key={column.id} column={column} tasks={tasks.filter((task) => task.status === column.id)} />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
