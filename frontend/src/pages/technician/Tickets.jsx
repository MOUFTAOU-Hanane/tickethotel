    import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function TechTickets() {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('actifs')
  const navigate = useNavigate()

  useEffect(() => { api.get('/tickets').then(r => setTickets(r.data)) }, [])

  const filtered = tickets.filter(t => filter === 'actifs' ? ['OPEN','IN_PROGRESS','ESCALATED'].includes(t.status) : ['RESOLVED','CLOSED'].includes(t.status))

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Mes Tickets</h1>
      <div className="flex gap-2">
        {['actifs','resolus'].map(f => <button key={f} onClick={() => setFilter(f)} className={f === filter ? 'btn-primary' : 'btn-secondary'}>{f === 'actifs' ? 'Actifs' : 'Résolus'}</button>)}
      </div>
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} onClick={() => navigate(`/technician/tickets/${t.id}`)} className="card cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div><p className="font-medium">{t.title}</p><p className="text-sm text-gray-400">{t.reference} · {t.scan_point_name} · {new Date(t.created_at).toLocaleDateString('fr')}</p></div>
              <div className="flex gap-2"><span className={`badge-${t.priority}`}>{t.priority}</span><span className={`badge-${t.status}`}>{t.status}</span></div>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="text-gray-400 text-center py-8">Aucun ticket</p>}
      </div>
    </div>
  )
}   