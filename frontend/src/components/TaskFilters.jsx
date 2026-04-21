import { useState } from 'react'

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
]

const priorityFilters = [
  { value: '', label: 'All' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export default function TaskFilters({ filters, onFilterChange, onClear }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {statusFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          >
            {priorityFilters.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Assigned To</label>
          <input
            type="text"
            value={filters.assigned_to || ''}
            onChange={(e) => onFilterChange('assigned_to', e.target.value)}
            placeholder="User ID"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Team</label>
          <input
            type="text"
            value={filters.team || ''}
            onChange={(e) => onFilterChange('team', e.target.value)}
            placeholder="Team ID"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onClear}
            className="w-full rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-300"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  )
}
