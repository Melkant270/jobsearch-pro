import React from 'react'
import JobCard from './JobCard'

export default function JobList({ jobs, loading, selectedJob, onSelectJob }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Recherche en cours...</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">\ud83d\udd0d</div>
          <p className="text-sm text-gray-500">
            Utilisez les filtres ci-dessus pour rechercher des offres d'emploi
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sources : Arbeitnow, La Bonne Alternance, Adzuna
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
        <p className="text-xs font-medium text-gray-600">
          {jobs.length} offre{jobs.length > 1 ? 's' : ''} trouv\u00e9e{jobs.length > 1 ? 's' : ''}
        </p>
      </div>
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          onSelect={onSelectJob}
        />
      ))}
    </div>
  )
}
