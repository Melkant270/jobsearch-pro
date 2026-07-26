import React, { useState, useCallback } from 'react'
import { apiUrl } from './api'
import Navbar from './components/Navbar'
import Filters from './components/Filters'
import JobList from './components/JobList'
import MapView from './components/MapView'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [mapCenter, setMapCenter] = useState([46.603354, 1.888334])
  const [searchLocation, setSearchLocation] = useState(null)
  const [radius, setRadius] = useState(50)

  const handleSearch = useCallback(async (filters) => {
    setLoading(true)
    setRadius(filters.radius)
    try {
      const resp = await fetch(apiUrl('/api/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      })
      const data = await resp.json()
      setJobs(data.jobs || [])
      if (filters.lat && filters.lng) {
        setMapCenter([filters.lat, filters.lng])
        setSearchLocation({ lat: filters.lat, lng: filters.lng })
      }
    } catch (e) {
      console.error('Search error:', e)
      setJobs([])
    }
    setLoading(false)
  }, [])

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[420px] min-w-[380px] flex flex-col border-r border-gray-200 bg-white">
          <Filters onSearch={handleSearch} />
          <JobList
            jobs={jobs}
            loading={loading}
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
          />
        </div>
        <div className="flex-1">
          <MapView
            jobs={jobs}
            center={mapCenter}
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
            searchLocation={searchLocation}
            radius={radius}
          />
        </div>
      </div>
    </div>
  )
}

export default App
