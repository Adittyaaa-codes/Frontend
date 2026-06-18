import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../services/api'

interface ChapterCardProps {
  _id: string
  chName: string
  subjectId: string
  subjectName?: string
}

function ChapterCard({ _id, chName, subjectId, subjectName = '' }: ChapterCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(chName)

  const handleEdit = async () => {
    if (isEditing) {
      try {
        await api.put(`/chapters/update/${_id}`, { chapterName: editedName })
        window.location.reload()
      } catch (error) {
        console.error("Failed to update chapter:", error)
      }
    }
    setIsEditing(!isEditing)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      try {
        await api.delete(`/chapters/del/${_id}`)
        window.location.reload()
      } catch (error) {
        console.error("Failed to delete chapter:", error)
      }
    }
  }

  return (
    <div className="flex items-center justify-between bg-base px-3 py-2.5 rounded-xl border border-subtle hover:border-accent/50 transition-colors group">
      <div className="flex-1 mr-4">
        {isEditing ? (
          <input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="w-full bg-surface border border-subtle rounded-lg px-2 py-0.5 text-primary text-sm focus:border-accent outline-none"
            autoFocus
          />
        ) : (
          <span className="text-sm text-primary">{chName}</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="text-[10px] text-muted hover:text-accent-light border border-subtle px-1.5 py-0.5 rounded transition-colors"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="text-[10px] text-muted hover:text-danger border border-subtle px-1.5 py-0.5 rounded transition-colors"
          >
            Delete
          </button>
        </div>
        <Link
          to={`/chat/${subjectId}?chapterId=${_id}&subjectName=${encodeURIComponent(subjectName)}&chapterName=${encodeURIComponent(chName)}`}
          className="text-xs font-medium text-accent-light bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-1 rounded-lg transition-colors whitespace-nowrap"
        >
          Open Chat →
        </Link>
      </div>
    </div>
  )
}

export default ChapterCard