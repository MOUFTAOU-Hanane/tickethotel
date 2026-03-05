import { useState, useEffect } from 'react'
import api from '../../services/api'

const PRIORITIES = ['URGENT','HAUTE','MOYENNE','NORMALE','BASSE']
const PRIORITY_COLORS = { URGENT:'red', HAUTE:'orange', MOYENNE:'yellow', NORMALE:'blue', BASSE:'gray' }

export default function AdminFaults() {
  const [faults, setFaults] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', category_id:'', default_priority:'NORMALE' })

  const load = () => { api.get('/faults').then(r => setFaults(r.data)); api.get('/categories').then(r => setCategories(r.data)) }
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault(); await api.post('/faults', form); setShowForm(false); setForm({ name:'', category_id:'', default_priority:'NORMALE' }); load()
  }
  const toggle = async (id) => { await api.patch(`/faults/${id}/toggle`); load() }
  const remove = async (id) => { if (confirm('Supprimer cette panne ?')) { await api.delete(`/faults/${id}`); load() } }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pannes Prédéfinies</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter une panne</button>
      </div>

      <div className="card bg-teal-50 border-teal-100">
        <p className="text-sm text-teal-700">🤖 <strong>Suggestions IA :</strong> Basé sur vos 30 derniers tickets, "Fuite d'eau" et "Problème Wi-Fi" sont les pannes les plus fréquentes. Assurez-vous qu'elles soient bien activées.</p>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">Nouvelle panne prédéfinie</h2>
          <form onSubmit={create} className="grid grid-cols-3 gap-4">
            <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ex: Fuite d'eau" /></div>
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.category_id} onChange={e => setForm(p => ({...p, category_id: e.target.value}))}>
                <option value="">Sélectionner...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priorité par défaut</label>
              <select className="input" value={form.default_priority} onChange={e => setForm(p => ({...p, default_priority: e.target.value}))}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Panne','Catégorie','Priorité','Statut','Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {faults.map(f => (
              <tr key={f.id}>
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: f.color + '20', color: f.color }}>{f.category_name}</span></td>
                <td className="px-4 py-3"><span className={`badge-${f.default_priority}`}>{f.default_priority}</span></td>
                <td className="px-4 py-3"><span className={f.active ? 'text-green-600' : 'text-gray-400'}>{f.active ? '✅ Actif' : '⏸️ Inactif'}</span></td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => toggle(f.id)} className="text-sm text-blue-600 hover:underline">{f.active ? 'Désactiver' : 'Activer'}</button>
                  <button onClick={() => remove(f.id)} className="text-sm text-red-500 hover:underline">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}