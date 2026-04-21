import { useEffect, useState } from 'react'
import api from '../api/axios'

export default function TeamSwitcher({ selectedTeamId, onTeamChange }) {
  const [teams, setTeams] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams/')
      setTeams(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch teams', error)
    }
  }

  const selectedTeam = teams.find((t) => t.id === parseInt(selectedTeamId))

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>{selectedTeam?.name || 'All Teams'}</span>
        <svg
          className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
          <button
            onClick={() => {
              onTeamChange(null)
              setIsOpen(false)
            }}
            className={`block w-full px-4 py-2 text-left text-sm ${
              !selectedTeamId
                ? 'bg-blue-50 font-medium text-blue-600'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Teams
          </button>
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                onTeamChange(team.id)
                setIsOpen(false)
              }}
              className={`block w-full px-4 py-2 text-left text-sm ${
                selectedTeamId === team.id
                  ? 'bg-blue-50 font-medium text-blue-600'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
