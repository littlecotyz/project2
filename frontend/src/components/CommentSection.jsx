import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { formatDate } from '../utils/formatDate'
import api from '../api/axios'

export default function CommentSection({ taskId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Poll for comments every 10 seconds
  useEffect(() => {
    fetchComments()
    const interval = setInterval(fetchComments, 10000)
    return () => clearInterval(interval)
  }, [taskId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/tasks/${taskId}/comments/`)
      setComments(response.data.results || response.data)
    } catch (error) {
      console.error('Failed to fetch comments', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.post(`/tasks/${taskId}/comments/`, {
        content: newComment,
      })
      // Optimistically add comment to list
      setComments((prev) => [...prev, response.data])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Comments</h3>

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading && comments.length === 0 ? (
          <div className="py-4 text-center text-slate-600">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-slate-600">No comments yet</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                {comment.author.avatar ? (
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white">
                    {comment.author.username[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-slate-900">{comment.author.username}</span>
                    <span className="text-xs text-slate-500">{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
