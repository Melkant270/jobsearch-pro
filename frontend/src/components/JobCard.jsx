import React from 'react'

const sourceBadgeColors = {
  'Arbeitnow': 'bg-green-100 text-green-700',
  'La Bonne Alternance': 'bg-purple-100 text-purple-700',
  'Adzuna': 'bg-orange-100 text-orange-700',
}

const typeBadgeColors = {
  'CDI': 'bg-blue-100 text-blue-700',
  'CDD': 'bg-yellow-100 text-yellow-700',
  'Stage': 'bg-pink-100 text-pink-700',
  'Alternance': 'bg-purple-100 text-purple-700',
  'Freelance': 'bg-teal-100 text-teal-700',
  'Temps partiel': 'bg-gray-100 text-gray-700',
  'Remote': 'bg-emerald-100 text-emerald-700',
}

export default function JobCard({ job, isSelected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(job)}
      className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-indigo-50 ${
        isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{job.title}</h3>
      </div>
      <p className="text-xs text-gray-600 mt-0.5">{job.company}</p>
      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
        {job.location && (
          <span className="text-xs text-gray-500 flex items-center gap-0.5">
            \ud83d\udccd {job.location}
          </span>
        )}
        {job.type && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeBadgeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
            {job.type}
          </span>
        )}
        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${sourceBadgeColors[job.source] || 'bg-gray-100 text-gray-600'}`}>
          {job.source}
        </span>
      </div>
      {job.salary && <p className="text-xs text-green-600 font-medium mt-1">\ud83d\udcb0 {job.salary}</p>}
      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-block mt-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Voir l'offre \u2192
        </a>
      )}
    </div>
  )
}
