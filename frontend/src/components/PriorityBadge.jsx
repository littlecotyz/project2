const priorityConfig = {
  low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
  critical: { bg: 'bg-red-100', text: 'text-red-800', label: 'Critical' },
}

export default function PriorityBadge({ priority }) {
  const config = priorityConfig[priority] || priorityConfig.medium
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}
