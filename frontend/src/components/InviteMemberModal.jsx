import { useState } from 'react'
import { toast } from 'react-hot-toast'
import api from '../api/axios'

export default function InviteMemberModal({ isOpen, onClose, teamId, onMemberAdded }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post(`/teams/${teamId}/add-member/`, { email })
      toast.success('Member invited successfully')
      setEmail('')
      onMemberAdded()
      onClose()
    } catch (error) {
      const message = error.response?.data?.detail || error.response?.data?.email?.[0] || 'Failed to invite member'
      toast.error(message)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900">Invite Member</h2>
        <p className="mt-1 text-sm text-slate-600">Enter the email address of the person you want to invite</p>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              placeholder="colleague@example.com"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                onClose()
                setEmail('')
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
              {isSubmitting ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
