import { useState } from 'react'
import { api } from '../services/api'
import type { ApiResponse, Chapter } from '../types/interface'
// import { Link } from 'react-router-dom'
import ChapterCard from './ChapterCard'

interface SubjectCardProps {
  _id: string
  subName: string
  desc: string
  chapters: Chapter[]
}

function SubjectCard({ _id, subName, desc, chapters }: SubjectCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [chapterList, setChapterList] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(subName)
  const [editedDesc, setEditedDesc] = useState(desc)
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [newChName, setNewChName] = useState('')
  const [isAddingChapter, setIsAddingChapter] = useState(false)

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    if (chapterList.length > 0) {
      setIsOpen(true)
      return
    }

    try {
      setLoading(true)
      setIsOpen(true)
      const { data } = await api.get<ApiResponse<Chapter[]>>(`/chapters/get-all/${_id}`)
      setChapterList(data.data)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (isEditing) {
      try {
        await api.put(`/subjects/edit/${_id}`, { subName: editedName, desc: editedDesc })
        window.location.reload() // Simple way to refresh UI
      } catch (error) {
        console.error("Failed to update subject:", error)
      }
    }
    setIsEditing(!isEditing)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this subject and all its chapters?")) {
      try {
        await api.delete(`/subjects/delete/${_id}`)
        window.location.reload()
      } catch (error) {
        console.error("Failed to delete subject:", error)
      }
    }
  }

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChName.trim()) return

    try {
      setIsAddingChapter(true)
      const { data } = await api.post(`/chapters/add/${_id}`, { chapterName: newChName })
      setNewChName('')
      setShowAddChapter(false)
      // Refresh list
      setChapterList(prev => [...prev, data.data])
    } catch (error) {
      console.error("Failed to add chapter:", error)
    } finally {
      setIsAddingChapter(false)
    }
  }

  return (
    <div className="bg-surface border border-subtle rounded-xl p-5 hover:border-accent transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-base border border-subtle rounded px-2 py-1 text-primary text-sm focus:border-accent outline-none"
              />
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full bg-base border border-subtle rounded px-2 py-1 text-muted text-xs focus:border-accent outline-none h-16"
              />
            </div>
          ) : (
            <>
              <h2 className="text-lg font-medium text-primary mb-2">{subName}</h2>
              <p className="text-sm text-muted mb-4">{desc || "No description"}</p>
            </>
          )}
          <div className="inline-flex items-center text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {chapters.length} chapters
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 justify-end">
            <button
               onClick={handleEdit}
               className="text-[10px] text-muted hover:text-accent border border-subtle hover:border-accent px-2 py-1 rounded transition-colors"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
            <button
               onClick={handleDelete}
               className="text-[10px] text-muted hover:text-red-400 border border-subtle hover:border-red-400 px-2 py-1 rounded transition-colors"
            >
              Delete
            </button>
          </div>
          <button
            onClick={handleToggle}
            className="text-xs text-muted hover:text-primary border border-subtle hover:border-accent px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {isOpen ? '▲ Hide' : '▼ View Chapters'}
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-4 border-t border-subtle pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Chapters</h3>
            <button
              onClick={() => setShowAddChapter(!showAddChapter)}
              className="text-[10px] font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {showAddChapter ? 'Cancel' : '+ Add Chapter'}
            </button>
          </div>

          {showAddChapter && (
            <form onSubmit={handleAddChapter} className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <input
                value={newChName}
                onChange={(e) => setNewChName(e.target.value)}
                placeholder="Chapter name..."
                className="flex-1 bg-base border border-subtle rounded-lg px-3 py-1.5 text-xs text-primary focus:border-accent outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isAddingChapter}
                className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                {isAddingChapter ? '...' : 'Add'}
              </button>
            </form>
          )}

          {loading ? (
            <p className="text-xs text-muted">Loading chapters...</p>
          ) : chapterList.length === 0 ? (
            <p className="text-xs text-muted">No chapters found.</p>
          ) : (
            <div className="space-y-2">
              {chapterList.map((chapter) => (
                <ChapterCard
                  key={chapter._id}
                  _id={chapter._id}
                  chName={chapter.chName}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SubjectCard