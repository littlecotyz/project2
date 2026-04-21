import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

export default function CreateTeamModal({ isOpen, onClose, onTeamCreated }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    avatar: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }))
      const reader = new FileReader()
      reader.onload = (evt) => {
        setPreviewUrl(evt.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Team name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('description', form.description)
      if (form.avatar) {
        formData.append('avatar', form.avatar)
      }

      await api.post('/teams/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toast.success('Team created successfully')
      setForm({ name: '', description: '', avatar: null })
      setPreviewUrl(null)
      onTeamCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || 'Failed to create team')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">Create Team</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Team Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="My awesome team"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="What is this team about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Team Avatar</label>
            <div className="mt-2 flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose()
                setForm({ name: '', description: '', avatar: null })
                setPreviewUrl(null)
              }}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
