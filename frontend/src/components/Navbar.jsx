import React from 'react'

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h1 className="text-xl font-bold tracking-tight">Recherche d'Emploi</h1>
      </div>
      <div className="text-sm opacity-80">Trouvez votre prochain emploi en France et en Europe</div>
    </nav>
  )
}
