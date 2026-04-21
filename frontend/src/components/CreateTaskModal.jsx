import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    deadline: '',
    assigned_to: [],
    team: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [teams, setTeams] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetchTeams()
    }
  }, [isOpen])

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams/')
      setTeams(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch teams', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || null,
        team: form.team || null,
      }
      const response = await api.post('/tasks/', payload)
      if (form.assigned_to.length > 0) {
        await api.post(`/tasks/${response.data.id}/assign/`, {
          user_ids: form.assigned_to,
        })
      }
      toast.success('Task created')
      onTaskCreated()
      setForm({ title: '', description: '', priority: 'medium', deadline: '', assigned_to: [], team: '' })
      onClose()
    } catch (error) {
      toast.error('Failed to create task')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">Create Task</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus:border-slate-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Deadline</label>
              <input
                name="deadline"
                type="datetime-local"
                value={form.deadline}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {teams.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Team</label>
              <select
                name="team"
                value={form.team}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
              >
                <option value="">None</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
