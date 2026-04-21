import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { formatDate } from '../utils/formatDate'
import api from '../api/axios'
import PriorityBadge from '../components/PriorityBadge'
import CommentSection from '../components/CommentSection'

export default function TaskDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/tasks/${id}/`)
      setTask(response.data)
    } catch (error) {
      toast.error('Failed to load task')
      navigate('/dashboard/tasks')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-slate-600">Loading task...</div>
  }

  if (!task) {
    return <div className="py-12 text-center text-slate-600">Task not found</div>
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-600 hover:text-slate-900"
      >
        ← Back
      </button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <PriorityBadge priority={task.priority} />
                <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-sm font-medium text-slate-900">
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {task.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-slate-600">{task.description}</p>
                </div>
              )}

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Created By</dt>
                  <dd className="mt-1 text-sm text-slate-900">{task.created_by.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Created</dt>
                  <dd className="mt-1 text-sm text-slate-900">{formatDate(task.created_at)}</dd>
                </div>
                {task.deadline && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Deadline</dt>
                    <dd className="mt-1 text-sm text-slate-900">{formatDate(task.deadline)}</dd>
                  </div>
                )}
                {task.team && (
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Team</dt>
                    <dd className="mt-1 text-sm text-slate-900">{task.team.name}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <CommentSection taskId={id} />
          </div>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Attachments</h2>
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100"
                  >
                    <span className="text-sm font-medium text-slate-900">{attachment.file.split('/').pop()}</span>
                    <span className="text-xs text-slate-500">by {attachment.uploaded_by?.username}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Assigned To</h3>
          {task.assigned_to && task.assigned_to.length > 0 ? (
            <div className="space-y-2">
              {task.assigned_to.map((user) => (
                <div key={user.id} className="flex items-center gap-2 text-sm text-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                    {user.username[0].toUpperCase()}
                  </div>
                  {user.username}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Not assigned</p>
          )}
        </div>
      </div>
    </div>
  )
}
