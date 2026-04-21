import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { DragDropContext, Droppable } from '@hello-pangea/dnd'
import api from '../api/axios'
import TaskCard from '../components/TaskCard'
import TaskFilters from '../components/TaskFilters'
import CreateTaskModal from '../components/CreateTaskModal'
import TeamSwitcher from '../components/TeamSwitcher'
import PriorityBadge from '../components/PriorityBadge'

const statuses = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
  { id: 'blocked', title: 'Blocked', color: 'bg-red-100' },
]

export default function TaskBoardPage() {
  const [tasks, setTasks] = useState({})
  const [filters, setFilters] = useState({})
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [filters, selectedTeamId])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to)
      if (filters.team) params.append('team', filters.team)
      if (selectedTeamId) params.append('team', selectedTeamId)

      const response = await api.get(`/tasks/?${params}`)
      const tasksList = response.data.results || response.data

      const groupedTasks = {
        todo: [],
        in_progress: [],
        done: [],
        blocked: [],
      }

      tasksList.forEach((task) => {
        if (groupedTasks[task.status]) {
          groupedTasks[task.status].push(task)
        }
      })

      setTasks(groupedTasks)
    } catch (error) {
      toast.error('Failed to load tasks')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const taskId = draggableId.replace('task-', '')
    const newStatus = destination.droppableId

    try {
      await api.patch(`/tasks/${taskId}/`, { status: newStatus })
      toast.success('Task status updated')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to update task status')
      console.error(error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">Task Board</h1>
          <TeamSwitcher selectedTeamId={selectedTeamId} onTeamChange={setSelectedTeamId} />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
        >
          + New Task
        </button>
      </div>

      <TaskFilters filters={filters} onFilterChange={handleFilterChange} onClear={handleClearFilters} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statuses.map((status) => (
            <Droppable key={status.id} droppableId={status.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`rounded-2xl border-2 border-dashed p-4 transition ${
                    snapshot.isDraggingOver ? `${status.color} border-slate-400` : 'border-slate-200 bg-white'
                  }`}
                >
                  <h2 className="mb-4 flex items-center justify-between font-semibold text-slate-900">
                    <span>{status.title}</span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-sm font-medium text-slate-700">
                      {tasks[status.id]?.length || 0}
                    </span>
                  </h2>

                  <div className="space-y-3">
                    {tasks[status.id]?.map((task, index) => (
                      <TaskCard key={task.id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onTaskCreated={fetchTasks} />
    </div>
  )
}
