import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SuperHotels() {
  const [hotels, setHotels] = useState([])
  const [plans, setPlans] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', address:'', plan_id:'' })

  const load = () => { api.get('/hotels').then(r => setHotels(r.data)); api.get('/plans').then(r => setPlans(r.data)) }
  useEffect(() => { load() }, [])

  const create = async (e) => { e.preventDefault(); await api.post('/hotels', form); setShowForm(false); load() }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hôtels ({hotels.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter un hôtel</button>
      </div>
      {showForm && (
        <div className="card">
          <form onSubmit={create} className="grid grid-cols-3 gap-4">
            <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></div>
            <div><label className="label">Adresse</label><input className="input" value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} /></div>
            <div><label className="label">Plan</label><select className="input" value={form.plan_id} onChange={e => setForm(p => ({...p, plan_id: e.target.value}))}><option value="">Choisir...</option>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="col-span-3 flex gap-2"><button type="submit" className="btn-primary">Créer</button><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button></div>
          </form>
        </div>
      )}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr>{['Hôtel','Adresse','Plan','Tickets','Utilisateurs','Créé le'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {hotels.map(h => (
              <tr key={h.id}>
                <td className="px-4 py-3 font-medium">{h.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{h.address}</td>
                <td className="px-4 py-3"><span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{h.plan_name}</span></td>
                <td className="px-4 py-3">{h.ticket_count}</td>
                <td className="px-4 py-3">{h.user_count}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(h.created_at).toLocaleDateString('fr')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}