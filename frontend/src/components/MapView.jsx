import React, { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 10)
    }
  }, [center, zoom, map])
  return null
}

export default function MapView({ jobs, center, selectedJob, onSelectJob, searchLocation, radius }) {
  const jobsWithCoords = jobs.filter(j => j.lat && j.lng)

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={6}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={searchLocation ? 10 : 6} />

        {searchLocation && (
          <Circle
            center={[searchLocation.lat, searchLocation.lng]}
            radius={radius * 1000}
            pathOptions={{
              color: '#4f46e5',
              fillColor: '#4f46e5',
              fillOpacity: 0.08,
              weight: 2,
            }}
          />
        )}

        {jobsWithCoords.map((job) => (
          <Marker
            key={job.id}
            position={[job.lat, job.lng]}
            icon={selectedJob?.id === job.id ? selectedIcon : new L.Icon.Default()}
            eventHandlers={{
              click: () => onSelectJob(job),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm">{job.title}</h3>
                <p className="text-xs text-gray-600">{job.company}</p>
                <p className="text-xs text-gray-500 mt-1">\ud83d\udccd {job.location}</p>
                {job.type && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-1 inline-block">{job.type}</span>}
                {job.url && (
                  <a href={job.url} target="_blank" rel="noopener noreferrer" className="block mt-2 text-xs text-indigo-600 hover:underline">
                    Voir l'offre \u2192
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
