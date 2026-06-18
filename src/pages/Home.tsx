import { api } from '../services/api'
import SubjectCard from '../components/SubjectCard'
import { useEffect, useState } from 'react'
import type { Chapter } from '../types/interface'

interface Subject {
  _id: string
  subName: string
  desc: string
  chapters: Chapter[]
  createdAt?: string
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [subName, setSubName] = useState('')
  const [subDesc, setSubDesc] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const fetchData = async () => {
    try {
      const { data } = await api.get('/subjects/get-all-subjects')
      // Reverse so newest-added appears first (API returns oldest-first)
      setSubjects((data.data as Subject[]).slice().reverse())
    } catch (error) {
      console.log("Error->", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subName.trim()) return

    try {
      setIsAdding(true)
      await api.post('/subjects/add', { subName, desc: subDesc })
      setSubName('')
      setSubDesc('')
      setShowAddForm(false)
      fetchData()
    } catch (error) {
      console.error("Failed to add subject:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-base flex flex-col items-center px-4 font-sans text-primary pb-16"
      style={{ backgroundImage: 'radial-gradient(at 50% 0%, rgba(124,58,237,0.1) 0px, transparent 60%)' }}
    >
      {/* ── Hero */}
      <div className="w-full max-w-2xl pt-16 pb-10 text-center">
        {/* Glow orb */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center text-3xl mb-6 shadow-glow-md">
          ✦
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-accent-light to-purple-300 bg-clip-text text-transparent">
            StudyBot
          </span>
        </h1>
        <p className="mt-3 text-muted text-sm max-w-sm mx-auto leading-relaxed">
          Your personalised AI-powered study companion. Upload your notes, ask questions,
          and get instant answers from your own documents.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[
            { icon: '📄', label: 'Upload PDFs & Docs' },
            { icon: '💬', label: 'Chat with your notes' },
            { icon: '🧠', label: 'AI-powered answers' },
            { icon: '📚', label: 'Organised by subject' },
          ].map(f => (
            <span
              key={f.label}
              className="text-xs text-muted bg-surface-2 border border-subtle rounded-full px-3 py-1.5 flex items-center gap-1.5 hover:border-accent/40 transition-colors"
            >
              <span>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Subjects section */}
      <div className="w-full max-w-2xl">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Subjects</h2>
            <p className="text-xs text-muted mt-0.5">
              {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · newest first
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-medium text-accent-light bg-accent/10 hover:bg-accent/20 border border-accent/25 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            {showAddForm ? '✕ Cancel' : '+ Add Subject'}
          </button>
        </div>

        {/* Add subject form */}
        {showAddForm && (
          <form
            onSubmit={handleAddSubject}
            className="bg-surface-2 border border-accent/25 rounded-2xl p-5 mb-5 space-y-4 shadow-card"
          >
            <h3 className="text-sm font-semibold text-white">New Subject</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">Subject Name</label>
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full bg-base border border-subtle rounded-xl px-3 py-2.5 text-sm text-primary focus:border-accent/60 outline-none transition-colors placeholder:text-muted-2"
                required
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">Description <span className="text-muted-2">(optional)</span></label>
              <textarea
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                placeholder="Brief description of the subject..."
                className="w-full bg-base border border-subtle rounded-xl px-3 py-2.5 text-sm text-primary focus:border-accent/60 outline-none h-20 transition-colors placeholder:text-muted-2 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition-colors shadow-glow-sm hover:shadow-glow-md"
            >
              {isAdding ? 'Creating…' : 'Create Subject'}
            </button>
          </form>
        )}

        {/* Subject cards */}
        {subjects.length === 0 ? (
          <div className="text-center py-16 text-muted border border-dashed border-subtle rounded-2xl">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-sm font-medium text-white">No subjects yet</p>
            <p className="text-xs mt-1">Add your first subject to get started</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                _id={subject._id}
                subName={subject.subName}
                desc={subject.desc}
                chapters={subject.chapters}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
