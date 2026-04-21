import { format } from 'date-fns'

export function formatDate(value) {
  if (!value) return ''
  return format(new Date(value), 'PPP')
}
