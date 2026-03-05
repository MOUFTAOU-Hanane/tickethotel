import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const STATUSES = ['Tous','OPEN','IN_PROGRESS','ESCALATED','RESOLVED','CLOSED']
const PRIORITIES = ['Toutes','URGENT','HAUTE','NORMALE','BASSE']

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [status, setStatus] = useState('Tous')
  const [priority, setPriority] = useState('Toutes')
  const [search, setSearch] = useState('')
  const [assigning, setAssigning] = useState(false)
  const navigate = useNavigate()

  const load = () => api.get('/tickets').then(r => setTickets(r.data))
  useEffect(() => { load() }, [])

  const aiAssignAll = async () => {
    setAssigning(true)
    try { await api.post('/ai/assign-all'); load() }
    finally { setAssigning(false) }
  }

  const filtered = tickets.filter(t => {
    if (status !== 'Tous' && t.status !== status) return false
    if (priority !== 'Toutes' && t.priority !== priority) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.reference.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Incidents ({filtered.length})</h1>
        <button onClick={aiAssignAll} disabled={assigning} className="btn-teal flex items-center gap-2">
          🤖 {assigning ? 'Assignation...' : 'Assigner par IA'}
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3">
          <input className="input max-w-xs" placeholder="🔍 Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input max-w-[160px]" value={status} onChange={e => setStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="input max-w-[160px]" value={priority} onChange={e => setPriority(e.target.value)}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Référence','Titre','Localisation','Priorité','Statut','Technicien','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(t => (
              <tr key={t.id} onClick={() => navigate(`/admin/tickets/${t.id}`)} className="hover:bg-blue-50 cursor-pointer transition-colors">
                <td className="px-4 py-3 font-mono text-blue-600 font-medium">{t.reference}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{t.title}</p>
                  {t.assigned_by_ai && <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🤖 IA</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{t.scan_point_name || '—'}</td>
                <td className="px-4 py-3"><span className={`badge-${t.priority}`}>{t.priority}</span></td>
                <td className="px-4 py-3"><span className={`badge-${t.status}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-gray-500">{t.technician_name || '—'}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(t.created_at).toLocaleDateString('fr')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && <p className="text-center text-gray-400 py-8">Aucun ticket trouvé</p>}
      </div>
    </div>
  )
}