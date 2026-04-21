import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import InviteMemberModal from '../components/InviteMemberModal'
import PriorityBadge from '../components/PriorityBadge'

const statusTabs = [
  { id: 'all', label: 'All Tasks' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'done', label: 'Done' },
  { id: 'blocked', label: 'Blocked' },
]

export default function TeamDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [activeStatus, setActiveStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchTeam()
    fetchTasks()
  }, [id])

  useEffect(() => {
    fetchTasks()
  }, [activeStatus])

  const fetchTeam = async () => {
    try {
      const response = await api.get(`/teams/${id}/`)
      setTeam(response.data)
      // Check if current user is team owner
      const username = localStorage.getItem('username')
      setIsOwner(response.data.owner?.username === username)
    } catch (error) {
      toast.error('Failed to load team')
      navigate('/teams')
    }
  }

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({ team: id })
      if (activeStatus !== 'all') {
        params.append('status', activeStatus)
      }
      const response = await api.get(`/teams/${id}/tasks/?${params}`)
      setTasks(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch tasks', error)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the team?')) return

    try {
      await api.post(`/teams/${id}/remove-member/`, { user_id: userId })
      toast.success('Member removed')
      fetchTeam()
    } catch (error) {
      toast.error('Failed to remove member')
      console.error(error)
    }
  }

  if (!team) {
    return <div className="py-12 text-center text-slate-600">Loading team...</div>
  }

  const filteredTasks = activeStatus === 'all' ? tasks : tasks.filter((t) => t.status === activeStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/teams')}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Teams
          </button>
          <div className="mt-3 flex items-center gap-4">
            {team.avatar && (
              <img
                src={team.avatar}
                alt={team.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
              {team.description && (
                <p className="mt-1 text-slate-600">{team.description}</p>
              )}
            </div>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Invite Member
          </button>
        )}
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Team Members ({team.members?.length || 0})</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {team.members?.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm"
            >
              {member.avatar && (
                <img
                  src={member.avatar}
                  alt={member.username}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="font-medium text-slate-900">{member.username}</span>
              {member.username === team.owner?.username && (
                <span className="text-xs font-medium text-blue-600">Owner</span>
              )}
              {isOwner && member.username !== team.owner?.username && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="ml-1 text-xs text-red-600 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks by Status */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Team Tasks</h2>
        
        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition ${
                activeStatus === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="py-8 text-center text-slate-600">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-slate-600">
            No tasks {activeStatus !== 'all' ? `in "${activeStatus}" status` : 'yet'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="w-full rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{task.title}</h3>
                    {task.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-600">{task.description}</p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <span className="text-xs font-medium text-slate-500">
                      {task.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={id}
        onMemberAdded={fetchTeam}
      />
    </div>
  )
}
