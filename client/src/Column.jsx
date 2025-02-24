/* eslint-disable react/prop-types */
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';

// eslint-disable-next-line react/prop-types
export function Column({ column, tasks }) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });


  return (
    <div className="flex w-full mx-auto flex-col rounded-lg bg-neutral-800 p-4">
      <h2 className="mb-4 font-semibold text-neutral-100">{column.title}</h2>
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-4">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
    </div>
  );
}
