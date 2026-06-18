import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import type { ApiResponse, Chapter } from '../types/interface'

interface Subject {
  _id: string
  subName: string
}

export default function UploadPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await api.get<ApiResponse<Subject[]>>('/subjects/get-all-subjects')
        setSubjects(data.data)
      } catch (err) {
        console.error('Failed to fetch subjects', err)
      }
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubject) {
      const fetchChapters = async () => {
        try {
          const { data } = await api.get<ApiResponse<Chapter[]>>(`/chapters/get-all/${selectedSubject}`)
          setChapters(data.data)
          setSelectedChapter('')
        } catch (err) {
          console.error('Failed to fetch chapters', err)
        }
      }
      fetchChapters()
    } else {
      setChapters([])
    }
  }, [selectedSubject])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadWithRetry = async (
    url: string,
    formData: FormData,
    maxRetries = 3
  ) => {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await api.post(url, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        });
      } catch (err: any) {
        if (err.response?.status === 429 && attempt < maxRetries - 1) {
          const delay = 3000 * Math.pow(2, attempt); // 3s, 6s, 12s
          setMessage(`Server is busy. Retrying in ${delay / 1000}s... (attempt ${attempt + 2}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
        } else {
          throw err;
        }
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubject || !selectedChapter || files.length === 0) {
      setMessage('Please select subject, chapter and at least one file.')
      setStatus('error')
      return
    }

    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('subject', selectedSubject)
    formData.append('chapter', selectedChapter)

    try {
      setStatus('uploading')
      setProgress(20)
      
      const response = await uploadWithRetry(
        `/upload/upload_docs`,
        formData
      );

      if (response?.data.success) {
        setStatus('success')
        setMessage('Your materials have been successfully indexed and are ready for study!')
        setFiles([])
        setSelectedSubject('')
        setSelectedChapter('')
      }
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      if (err.response?.status === 429) {
        setMessage('Server is temporarily overloaded. Please wait a minute and try again.')
      } else {
        setMessage(err.response?.data?.message || 'Upload failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-base py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between mb-8 -mt-6">
          <button
            type="button"
            onClick={onMenuOpen}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-surface transition-colors"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-white font-bold text-lg">Study<span className="text-accent">Bot</span></span>
          <div className="w-9" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Upload Study Materials</h1>
          <p className="mt-2 text-muted text-sm">Organize your notes and get them indexed for AI assistance</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Selection Card */}
          <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted block ml-1">Select Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-base border border-subtle rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none appearance-none transition-all hover:border-accent/50"
                  required
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.subName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted block ml-1">Select Chapter</label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  disabled={!selectedSubject}
                  className="w-full bg-base border border-subtle rounded-xl px-4 py-3 text-sm text-primary focus:border-accent outline-none appearance-none transition-all disabled:opacity-40 hover:border-accent/50"
                  required
                >
                  <option value="">Choose a chapter...</option>
                  {chapters.map(ch => (
                    <option key={ch._id} value={ch._id}>{ch.chName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt"
            />
            <div className="border-2 border-dashed border-subtle group-hover:border-accent/50 rounded-xl p-10 text-center transition-all duration-300 bg-base/30">
              <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="text-accent w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-primary">Drop files or click to browse</h3>
              <p className="text-xs text-muted mt-2">Support for PDF, DOCX, TXT (Max 10 files)</p>
            </div>
          </div>

          {/* File Preview */}
          {files.length > 0 && (
            <div className="bg-surface border border-subtle rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-2">Ready for upload</h3>
              <div className="space-y-2">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-base/50 p-3 rounded-xl border border-subtle">
                    <div className="flex items-center gap-3">
                      <FileText className="text-accent w-5 h-5" />
                      <div>
                        <p className="text-sm font-medium text-primary truncate max-w-xs">{file.name}</p>
                        <p className="text-[10px] text-muted">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeFile(idx)} 
                      className="text-muted hover:text-red-400 p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Message */}
          {status !== 'idle' && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in zoom-in-95 ${
              status === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
              status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-accent/10 border-accent/20 text-accent'
            }`}>
              {status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> :
               status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
               <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message || (status === 'uploading' ? `Uploading and indexing... ${progress}%` : '')}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'uploading' || files.length === 0}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-accent/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Materials...
              </>
            ) : (
              'Index for Study'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
