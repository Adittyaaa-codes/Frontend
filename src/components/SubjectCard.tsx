interface SubjectCardProps {
  subName: string
  desc: string
  chapters: string[]
}

function SubjectCard({ subName, desc, chapters }: SubjectCardProps) {
  return (
    <div className="bg-surface border border-subtle rounded-xl p-5 hover:border-accent transition-colors">
      <h2 className="text-lg font-medium text-primary mb-2">{subName}</h2>
      <p className="text-sm text-muted mb-4">{desc || "No description"}</p>
      <div className="inline-flex items-center text-xs font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
        {chapters.length} chapters
      </div>
    </div>
  )
}

export default SubjectCard