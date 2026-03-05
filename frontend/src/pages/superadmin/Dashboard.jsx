import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SuperDashboard() {
  const [hotels, setHotels] = useState([])

  useEffect(() => { api.get('/hotels').then(r => setHotels(r.data)) }, [])

  const mrr = hotels.reduce((acc, h) => acc + parseFloat(h.base_cost || 0), 0)
  const totalTickets = hotels.reduce((acc, h) => acc + parseInt(h.ticket_count || 0), 0)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard SuperAdmin</h1>
      <div className="grid grid-cols-3 gap-4">
        {[{label:'MRR',value:`${mrr.toFixed(0)}€`,icon:'💰'},{label:'Hôtels actifs',value:hotels.length,icon:'🏨'},{label:'Total tickets',value:totalTickets,icon:'🎫'}].map((s,i) => (
          <div key={i} className="card text-center"><span className="text-3xl">{s.icon}</span><p className="text-3xl font-bold mt-2">{s.value}</p><p className="text-sm text-gray-500">{s.label}</p></div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold mb-4">Hôtels récents</h2>
        <div className="space-y-2">
          {hotels.slice(0,5).map(h => (
            <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div><p className="font-medium text-sm">{h.name}</p><p className="text-xs text-gray-400">{h.address}</p></div>
              <span className="text-sm font-medium text-blue-700">{h.plan_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}