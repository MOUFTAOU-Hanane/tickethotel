import { useState, useEffect } from 'react'
import api from '../../services/api'

const Stars = ({ n }) => '⭐'.repeat(n) + '☆'.repeat(5 - n)

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)

  const load = () => { api.get('/reviews').then(r => setReviews(r.data)); api.get('/reviews/stats').then(r => setStats(r.data)) }
  useEffect(() => { load() }, [])

  const toggle = async (id) => { await api.patch(`/reviews/${id}/visibility`); load() }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Avis Clients</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card text-center col-span-1">
            <p className="text-5xl font-bold text-yellow-500">{stats.avg || '—'}</p>
            <p className="text-gray-500 text-sm mt-1">Note moyenne / 5</p>
            <p className="text-gray-400 text-xs">{stats.total} avis</p>
          </div>
          <div className="card"><p className="text-sm text-gray-500">Avis positifs</p><p className="text-2xl font-bold text-green-600">{stats.positive}</p></div>
          <div className="card"><p className="text-sm text-gray-500">Avis négatifs</p><p className="text-2xl font-bold text-red-600">{stats.negative}</p></div>
          <div className="card"><p className="text-sm text-gray-500">Taux positif</p><p className="text-2xl font-bold text-teal-600">{stats.total > 0 ? Math.round(stats.positive / stats.total * 100) : 0}%</p></div>
        </div>
      )}

      <div className="card bg-teal-50 border-teal-100">
        <p className="text-sm text-teal-700">🤖 <strong>Analyse IA — Thèmes détectés :</strong> Rapidité (92%) · Amabilité (88%) · Propreté (85%) · Bruit (14%) · Climatisation (8%)</p>
      </div>

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className={`card border-l-4 ${r.sentiment === 'POSITIF' ? 'border-green-400' : r.sentiment === 'NEGATIF' ? 'border-red-400' : 'border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{Stars(r.rating)}</span>
                  <span className={`badge-${r.sentiment}`}>{r.sentiment}</span>
                  <span className="text-xs text-gray-400">Ticket {r.reference}</span>
                  {r.technician_name && <span className="text-xs text-gray-400">· {r.technician_name}</span>}
                </div>
                <p className="text-sm text-gray-700">{r.comment || <em className="text-gray-400">Pas de commentaire</em>}</p>
                {r.themes?.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {r.themes.map(t => <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}
              </div>
              <button onClick={() => toggle(r.id)} className={`text-sm ml-4 shrink-0 ${r.visible ? 'text-red-500 hover:underline' : 'text-green-600 hover:underline'}`}>
                {r.visible ? 'Masquer' : 'Publier'}
              </button>
            </div>
          </div>
        ))}
        {!reviews.length && <p className="text-gray-400 text-center py-8">Aucun avis pour le moment</p>}
      </div>
    </div>
  )
}