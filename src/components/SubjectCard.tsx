import { useState } from 'react'
import {api} from '../services/api'
import type { ApiResponse, Chapter } from '../types/interface'

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

  return (
    <div className="bg-surface border border-subtle rounded-xl p-5 hover:border-accent transition-colors">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-primary mb-2">{subName}</h2>
          <p className="text-sm text-muted mb-4">{desc || "No description"}</p>
          <div className="inline-flex items-center text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
            {chapters.length} chapters
          </div>
        </div>

        {/* Dropdown toggle button */}
        <button
          onClick={handleToggle}
          className="text-xs text-muted hover:text-primary border border-subtle hover:border-accent px-3 py-1.5 rounded-lg transition-colors"
        >
          {isOpen ? '▲ Hide' : '▼ View Chapters'}
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="mt-4 border-t border-subtle pt-4 space-y-2">
          {loading ? (
            <p className="text-xs text-muted">Loading chapters...</p>
          ) : chapterList.length === 0 ? (
            <p className="text-xs text-muted">No chapters found.</p>
          ) : (
            chapterList.map((chapter) => (
              <div
                key={chapter._id}
                className="text-sm text-primary bg-base px-3 py-2 rounded-lg border border-subtle"
              >
                {chapter.chapterName}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default SubjectCard