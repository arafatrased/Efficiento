import { useState, useEffect } from 'react';
import { Column } from './Column';
import { DndContext } from '@dnd-kit/core';
import axios from 'axios';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  console.log(tasks)
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO' });
  console.log(newTask)

  // Fetch tasks when the component mounts
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await axios.get('http://localhost:5000/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }
    fetchTasks();
  }, []);

  // Handle drag and update task status
  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;

    // Update task status via API
    async function updateTaskStatus() {
      try {
        const response = await axios.patch(`http://localhost:5000/tasks/${taskId}`, {
          status: newStatus,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task._id === response.data._id ? response.data : task
          )
        );
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
      const response = await axios.post('http://localhost:5000/tasks', newTask);
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setNewTask({ title: '', description: '' }); // Clear form after submission
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
    <div className="p-4 flex flex-col bg-black min-h-screen text-white">
      <h1 className="text-3xl font-semibold text-center">Efficiento</h1>
      <p className='text-center text-gray-500'>Your Efficient Task Manager</p>
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
          <button type="submit" className="btn bg-blue-500 py-1 px-5 rounded-2xl text-neutral-100">Add Task</button>
        </form>
      </div>

      {/* Task Columns */}
      <div className="flex w-11/12 mx-auto flex-wrap gap-8">
        <DndContext onDragEnd={handleDragEnd}>
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((task) => task.status === column.id)}
            />
          ))}
        </DndContext>
      </div>
    </div>
  );
}
