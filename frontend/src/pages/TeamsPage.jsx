import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import CreateTeamModal from '../components/CreateTeamModal'

export default function TeamsPage() {
  const navigate = useNavigate()
  const [teams, setTeams] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/teams/')
      setTeams(response.data.results || response.data)
    } catch (error) {
      toast.error('Failed to fetch teams')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-slate-600">Loading teams...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Teams</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-slate-600">No teams yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => navigate(`/teams/${team.id}`)}
              className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:shadow-md"
            >
              {team.avatar && (
                <img
                  src={team.avatar}
                  alt={team.name}
                  className="mb-3 h-24 w-full rounded-lg object-cover"
                />
              )}
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600">{team.name}</h3>
              {team.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{team.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  {team.members?.length || 0} members
                </span>
                <span className="text-xs text-slate-400">
                  {team.owner?.username === localStorage.getItem('username') ? 'Owner' : 'Member'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTeamCreated={fetchTeams}
      />
    </div>
  )
}
