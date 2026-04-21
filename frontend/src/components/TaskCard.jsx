import { formatDate } from '../utils/formatDate'
import PriorityBadge from './PriorityBadge'
import { Draggable } from '@hello-pangea/dnd'
import { Link } from 'react-router-dom'

export default function TaskCard({ task, index }) {
  const avatarColors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500']

  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <Link
          to={`/tasks/${task.id}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${
            snapshot.isDragging ? 'opacity-50' : ''
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="text-sm font-semibold text-slate-900 line-clamp-2">{task.title}</h4>
            </div>

            {task.description && <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>}

            <div className="flex items-center justify-between gap-2">
              <PriorityBadge priority={task.priority} />
              {task.deadline && <time className="text-xs text-slate-500">{formatDate(task.deadline)}</time>}
            </div>

            {task.assigned_to.length > 0 && (
              <div className="flex items-center -space-x-2">
                {task.assigned_to.slice(0, 3).map((user, idx) => (
                  <div
                    key={user.id}
                    className={`${avatarColors[idx % avatarColors.length]} flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white border border-slate-200`}
                    title={user.username}
                  >
                    {user.username[0].toUpperCase()}
                  </div>
                ))}
                {task.assigned_to.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 border border-slate-300">
                    +{task.assigned_to.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </Link>
      )}
    </Draggable>
  )
}
