import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function TechDashboard() {
  const [tickets, setTickets] = useState([])
  const navigate = useNavigate()

  useEffect(() => { api.get('/tickets').then(r => setTickets(r.data)) }, [])

  const open = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  const resolved = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
  const urgent = tickets.filter(t => t.priority === 'URGENT' && t.status !== 'CLOSED').length

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mon Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {[{label:'Tickets actifs',value:open,icon:'⚙️',color:'blue'},{label:'Résolus',value:resolved,icon:'✅',color:'green'},{label:'Urgents',value:urgent,icon:'🚨',color:'red'}].map((s,i) => (
          <div key={i} className="card text-center">
            <span className="text-3xl">{s.icon}</span>
            <p className="text-3xl font-bold mt-2 text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Mes tickets urgents</h2>
        <div className="space-y-3">
          {tickets.filter(t => t.priority === 'URGENT' && t.status !== 'CLOSED').slice(0,5).map(t => (
            <div key={t.id} onClick={() => navigate(`/technician/tickets/${t.id}`)} className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
              <div><p className="font-medium text-sm">{t.title}</p><p className="text-xs text-gray-400">{t.reference} · {t.scan_point_name}</p></div>
              <span className={`badge-${t.status}`}>{t.status}</span>
            </div>
          ))}
          {!urgent && <p className="text-gray-400 text-sm text-center py-4">Aucun ticket urgent 🎉</p>}
        </div>
      </div>
    </div>
  )
}