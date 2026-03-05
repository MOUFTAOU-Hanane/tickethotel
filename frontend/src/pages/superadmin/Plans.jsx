import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SuperPlans() {
  const [plans, setPlans] = useState([])
  useEffect(() => { api.get('/plans').then(r => setPlans(r.data)) }, [])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Plans d'abonnement</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(p => (
          <div key={p.id} className="card border-2 border-gray-100">
            <h2 className="text-xl font-bold">{p.name}</h2>
            <p className="text-4xl font-bold text-blue-700 my-3">{p.base_cost}€<span className="text-sm text-gray-400">/mois</span></p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✅ {p.ticket_quota === 999999 ? 'Tickets illimités' : `${p.ticket_quota} tickets/mois`}</li>
              <li>✅ {p.max_technicians === 999 ? 'Techniciens illimités' : `${p.max_technicians} techniciens`}</li>
              <li>{p.has_ai ? '✅' : '❌'} Module IA inclus</li>
              <li>✅ Support email</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}