import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AdminSubscription() {
  const { user } = useAuth()
  const [hotel, setHotel] = useState(null)
  const [payments, setPayments] = useState([])
  const [plans, setPlans] = useState([])

  useEffect(() => {
    api.get(`/hotels/${user.hotel_id}`).then(r => setHotel(r.data))
    api.get(`/hotels/${user.hotel_id}/payments`).then(r => setPayments(r.data))
    api.get('/plans').then(r => setPlans(r.data))
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Abonnement & Paiements</h1>

      {hotel && (
        <div className="card border-2 border-blue-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Plan actuel</p>
              <h2 className="text-2xl font-bold text-blue-700">{hotel.plan_name}</h2>
              <p className="text-gray-500">{hotel.base_cost}€ / mois</p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">Actif</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Quota tickets</p>
              <p className="font-semibold">{hotel.ticket_quota === 999999 ? 'Illimité' : hotel.ticket_quota}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Techniciens max</p>
              <p className="font-semibold">{hotel.max_technicians === 999 ? 'Illimité' : hotel.max_technicians}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Plans disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className={`card border-2 ${hotel?.plan_name === p.name ? 'border-blue-400' : 'border-gray-100'}`}>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-3xl font-bold text-blue-700 my-2">{p.base_cost}€<span className="text-sm text-gray-400">/mois</span></p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✅ {p.ticket_quota === 999999 ? 'Tickets illimités' : `${p.ticket_quota} tickets/mois`}</li>
                <li>✅ {p.max_technicians === 999 ? 'Techniciens illimités' : `${p.max_technicians} techniciens`}</li>
                <li>{p.has_ai ? '✅' : '❌'} Module IA</li>
              </ul>
              {hotel?.plan_name === p.name && <p className="text-center text-sm text-blue-600 font-medium mt-3">Plan actuel</p>}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-700 mb-3">Historique des paiements</h2>
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>{['Date','Description','Montant','Statut'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="px-4 py-3">{new Date(p.paid_at).toLocaleDateString('fr')}</td>
                  <td className="px-4 py-3">{p.description}</td>
                  <td className="px-4 py-3 font-semibold">{p.amount}€</td>
                  <td className="px-4 py-3"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Payé</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}