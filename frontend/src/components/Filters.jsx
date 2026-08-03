import React, { useState } from 'react'
import { apiUrl } from '../api'

const JOB_TYPES = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance', 'Temps partiel']
const SECTORS = [
  'Tous secteurs',
  'Industrie',
  'Tech & Num\u00e9rique',
  'Finance & Comptabilit\u00e9',
  'Sant\u00e9 & Social',
  '\u00c9ducation & Formation',
  'BTP & Construction',
  'Commerce & Vente',
  'Logistique & Transport',
  'Juridique',
  'Art & Design',
  'Agriculture',
  '\u00c9nergie',
  'Autres'
]
const EDUCATION_LEVELS = ['Aucun', 'CAP/BEP', 'Bac', 'Bac+2', 'Bac+3', 'Bac+5', 'Doctorat']
const COUNTRIES = [
  'France', 'Allemagne', 'Belgique', 'Suisse', 'Luxembourg', 'Espagne', 'Italie',
  'Pays-Bas', 'Royaume-Uni', 'Portugal', 'Autriche', 'Irlande', 'Danemark',
  'Su\u00e8de', 'Norv\u00e8ge', 'Finlande', 'Pologne', 'R\u00e9publique Tch\u00e8que', 'Canada', '\u00c9tats-Unis', 'Autre'
]
const DATE_OPTIONS = [
  { value: '', label: 'Toutes les dates' },
  { value: '24h', label: 'Derni\u00e8res 24h' },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
]

export default function Filters({ onSearch }) {
  const [keyword, setKeyword] = useState('')
  const [jobTypes, setJobTypes] = useState([])
  const [sector, setSector] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [country, setCountry] = useState('France')
  const [city, setCity] = useState('')
  const [radius, setRadius] = useState(50)
  const [dateFilter, setDateFilter] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const toggleJobType = (type) => {
    setJobTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    let lat = null, lng = null

    if (city) {
      setGeocoding(true)
      try {
        const resp = await fetch(apiUrl(`/api/geocode?q=${encodeURIComponent(city + ', ' + country)}`))
        const data = await resp.json()
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat)
          lng = parseFloat(data[0].lon)
        }
      } catch (e) {
        console.error('Geocoding error:', e)
      }
      setGeocoding(false)
    }

    onSearch({
      keyword,
      job_types: jobTypes,
      sector,
      education_level: educationLevel,
      country,
      city,
      lat,
      lng,
      radius,
      date_filter: dateFilter,
    })
  }

  return (
    <form onSubmit={handleSearch} className="p-4 space-y-3 overflow-y-auto">
      {/* Keyword */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Mot-cl\u00e9 / Poste</label>
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="Ex: D\u00e9veloppeur, Technicien..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Job Types */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Type de contrat</label>
        <div className="flex flex-wrap gap-1.5">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleJobType(type)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                jobTypes.includes(type)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sector */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Secteur</label>
        <select
          value={sector}
          onChange={e => setSector(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
        >
          <option value="">Tous</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Education */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Niveau d'\u00e9tudes</label>
        <select
          value={educationLevel}
          onChange={e => setEducationLevel(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
        >
          <option value="">Tous</option>
          {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Country */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Pays</label>
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
        >
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* City */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Ville</label>
        <input
          type="text"
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Ex: Paris, Lyon..."
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
        />
      </div>

      {/* Radius */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Rayon : {radius} km
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={radius}
          onChange={e => setRadius(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>5 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Date filter */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Date de publication</label>
        <select
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs"
        >
          {DATE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={geocoding}
        className="w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm"
      >
        {geocoding ? 'G\u00e9olocalisation...' : '\ud83d\udd0d Rechercher'}
      </button>
    </form>
  )
}
