import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState<Subject[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/subjects/get-all-subjects')
        setSubjects(data.data)
        console.log(data.data)
      } catch (error) {
        console.log("Error->", error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center px-4 font-sans text-primary">
      {/* Heading */}
      <h1 className="text-3xl font-semibold text-primary tracking-tight text-center">
        Welcome to <span className="text-accent">StudyBot</span>
      </h1>
      <p className="mt-3 text-muted text-center text-sm max-w-sm">
        Your AI-powered study companion. Upload your notes, ask questions,
        and get instant answers from your own documents.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-3 mt-8">
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
      </div>

      {/* Subject Card */}
      <div className="mt-12 w-full max-w-2xl grid gap-4">
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
      <div className="flex flex-wrap justify-center gap-2 mt-12">
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
  )
}
