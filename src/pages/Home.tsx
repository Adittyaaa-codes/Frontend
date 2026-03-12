// import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import SubjectCard from '../components/SubjectCard'
import { useEffect, useState } from 'react'
import type { Chapter } from '../types/interface'

interface Subject {
  _id: string
  subName: string
  desc: string
  chapters: Chapter[]
}

export default function Home() {
  // const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [subName, setSubName] = useState('')
  const [subDesc, setSubDesc] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const fetchData = async () => {
    try {
      const { data } = await api.get('/subjects/get-all-subjects')
      setSubjects(data.data)
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
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 font-sans text-primary mt-4">
      {/* Heading */}
      <h1 className="text-3xl font-semibold text-primary tracking-tight text-center">
        Welcome to <span className="text-accent">StudyBot</span>
      </h1>
      <p className="mt-3 text-muted text-center text-sm max-w-sm">
        Your Personalised AI-powered study companion. Upload your notes, ask questions,
        and get instant answers from your own documents.
      </p>

      {/* CTA Buttons */}
      {/* <div className="flex gap-3 mt-8">
        <button
          onClick={() => navigate('/register')}
          className="px-5 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2.5 rounded-lg bg-transparent hover:bg-surface border border-subtle text-primary text-sm font-medium transition-colors"
        >
          Sign In
        </button>
      </div> */}

      {/* Subject Card List Header */}
      <div className="mt-12 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-primary">Your Subjects</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Subject'}
          </button>
        </div>

        {showAddForm && (
          <form 
            onSubmit={handleAddSubject}
            className="bg-surface border border-accent/30 rounded-xl p-5 mb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">Subject Name</label>
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="e.g. Mathematics"
                className="w-full bg-base border border-subtle rounded-lg px-3 py-2 text-sm text-primary focus:border-accent outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted">Description</label>
              <textarea
                value={subDesc}
                onChange={(e) => setSubDesc(e.target.value)}
                placeholder="Brief description of the subject..."
                className="w-full bg-base border border-subtle rounded-lg px-3 py-2 text-sm text-primary focus:border-accent outline-none h-20"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              {isAdding ? 'Adding...' : 'Create Subject'}
            </button>
          </form>
        )}

        <div className="grid gap-4">
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

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-12 mb-4">
        {[
          '📄 Upload PDFs & Docs',
          '💬 Chat with your notes',
          '🧠 AI-powered answers',
          '📚 Organised by subject',
        ].map(feature => (
          <span
            key={feature}
            className="text-xs text-muted bg-surface border border-subtle rounded-full px-3 py-1.5"
          >
            {feature}
          </span>
        ))}
      </div>
    </div>
    </div>
  )
}
