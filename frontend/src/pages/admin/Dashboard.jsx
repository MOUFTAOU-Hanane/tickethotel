import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../../services/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [tickets, setTickets] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data))
    api.get('/tickets').then(r => setTickets(r.data.slice(0, 5)))
  }, [])

  const chartData = stats ? [
    { name: 'Ouverts', value: stats.tickets.OPEN || 0, fill: '#3b82f6' },
    { name: 'En cours', value: stats.tickets.IN_PROGRESS || 0, fill: '#f59e0b' },
    { name: 'Escaladés', value: stats.tickets.ESCALATED || 0, fill: '#f97316' },
    { name: 'Résolus', value: stats.tickets.RESOLVED || 0, fill: '#10b981' },
    { name: 'Fermés', value: stats.tickets.CLOSED || 0, fill: '#6b7280' },
  ] : []

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tickets ouverts', value: stats?.tickets?.OPEN || 0, color: 'blue', icon: '🎫' },
          { label: 'En cours', value: stats?.tickets?.IN_PROGRESS || 0, color: 'yellow', icon: '⚙️' },
          { label: 'Techniciens', value: stats?.technicians || 0, color: 'teal', icon: '👷' },
          { label: 'Note moyenne', value: stats?.avg_rating ? `${stats.avg_rating}/5` : 'N/A', color: 'green', icon: '⭐' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{s.value}</p>
              </div>
              <span className="text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Répartition des tickets</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {chartData.map((entry, i) => <rect key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Derniers incidents</h2>
            <button onClick={() => navigate('/admin/tickets')} className="text-blue-600 text-sm hover:underline">Voir tout →</button>
          </div>
          <div className="space-y-3">
            {tickets.map(t => (
              <div key={t.id} onClick={() => navigate(`/admin/tickets/${t.id}`)} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.title}</p>
                  <p className="text-xs text-gray-400">{t.reference} · {t.scan_point_name}</p>
                </div>
                <span className={`badge-${t.status}`}>{t.status}</span>
              </div>
            ))}
            {!tickets.length && <p className="text-gray-400 text-sm text-center py-4">Aucun ticket</p>}
          </div>
        </div>
      </div>
    </div>
  )
}