import React, { useState, useCallback, useEffect } from 'react'
import { apiUrl } from './api'
import Navbar from './components/Navbar'
import Filters from './components/Filters'
import JobList from './components/JobList'
import MapView from './components/MapView'

function App() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [mapCenter, setMapCenter] = useState([46.603354, 1.888334])
  const [searchLocation, setSearchLocation] = useState(null)
  const [radius, setRadius] = useState(50)
  const [drawerOpen, setDrawerOpen] = useState(window.innerWidth >= 768)

  const handleSearch = useCallback(async (filters) => {
    setLoading(true)
    setError(null)
    setRadius(filters.radius || 50)
    try {
      const resp = await fetch(apiUrl('/api/search'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: filters.keyword || '',
          job_types: filters.job_types || [],
          sector: filters.sector || '',
          education_level: filters.education_level || '',
          country: filters.country || 'France',
          city: filters.city || '',
          lat: filters.lat || null,
          lng: filters.lng || null,
          radius: filters.radius || 50,
          date_filter: filters.date_filter || ''
        })
      })
      const data = await resp.json()
      setJobs(data.jobs || [])
      if (filters.lat && filters.lng) {
        setMapCenter([filters.lat, filters.lng])
        setSearchLocation({ lat: filters.lat, lng: filters.lng })
      }
    } catch (e) {
      console.error('Search error:', e)
      setError('Erreur lors de la recherche. Veuillez r\u00e9essayer.')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    handleSearch({ keyword: '', job_types: [], country: 'France', radius: 50 })
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Drawer */}
        <div className={`drawer ${drawerOpen ? 'open' : ''}`}>
          <Filters onSearch={handleSearch} />
        </div>
        {/* Toggle button */}
        <button
          className={`drawer-toggle ${drawerOpen ? 'open' : ''}`}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          {drawerOpen ? '\u2715' : '\u2630'}
        </button>
        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div style={{ height: '50%', minHeight: '300px' }}>
            <MapView
              jobs={jobs}
              center={mapCenter}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              searchLocation={searchLocation}
              radius={radius}
            />
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm">
                {error}
              </div>
            )}
            <JobList
              jobs={jobs}
              loading={loading}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
