import React from 'react'
import JobCard from './JobCard'

export default function JobList({ jobs, loading, selectedJob, onSelectJob }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-3 text-sm text-gray-500">Recherche en cours...</p>
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 px-6">
        <div className="text-center">
          <div className="text-4xl mb-3">\ud83d\udd0d</div>
          <p className="text-sm text-gray-500">
            Utilisez les filtres pour rechercher des offres d'emploi
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Sources : Arbeitnow, La Bonne Alternance, Adzuna
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-600">
          {jobs.length} offre{jobs.length > 1 ? 's' : ''} trouv\u00e9e{jobs.length > 1 ? 's' : ''}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedJob?.id === job.id}
            onSelect={onSelectJob}
          />
        ))}
      </div>
    </div>
  )
}
