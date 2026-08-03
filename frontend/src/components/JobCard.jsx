import React from 'react'

const sourceBadgeColors = {
  'Arbeitnow': 'bg-green-100 text-green-700',
  'La Bonne Alternance': 'bg-purple-100 text-purple-700',
  'Adzuna': 'bg-orange-100 text-orange-700',
  'France Travail': 'bg-blue-100 text-blue-700',
  'Indeed': 'bg-red-100 text-red-700',
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
      className={`p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 ${
        isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50' : 'bg-white'
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{job.title}</h3>
      <p className="text-xs text-gray-600 mt-1">{job.company}</p>
      {job.location && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-0.5">
          \ud83d\udccd {job.location}
          {job.distance_km != null && (
            <span className="ml-1 text-indigo-600 font-medium">({job.distance_km} km)</span>
          )}
        </p>
      )}
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        {job.type && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadgeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
            {job.type}
          </span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceBadgeColors[job.source] || 'bg-gray-100 text-gray-600'}`}>
          {job.source}
        </span>
      </div>
      {job.salary && <p className="text-xs text-green-600 font-medium mt-2">\ud83d\udcb0 {job.salary}</p>}
      {job.education_level && <p className="text-xs text-gray-500 mt-1">\ud83c\udf93 {job.education_level}</p>}
      {job.url && (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="inline-block mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 transition-colors"
        >
          Voir l'offre \u2192
        </a>
      )}
    </div>
  )
}
