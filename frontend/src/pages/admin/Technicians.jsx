import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminTechnicians() {
  const [techs, setTechs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ first_name:'', last_name:'', email:'', skills:'' })

  const load = () => api.get('/users').then(r => setTechs(r.data.filter(u => u.role === 'Technicien')))
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    await api.post('/users', { ...form, role: 'Technicien', skills: form.skills.split(',').map(s => s.trim()).filter(Boolean) })
    setForm({ first_name:'', last_name:'', email:'', skills:'' }); setShowForm(false); load()
  }

  const toggle = async (u) => { await api.put(`/users/${u.id}`, { ...u, status: u.status === 'actif' ? 'inactif' : 'actif' }); load() }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Techniciens ({techs.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter</button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">Nouveau technicien</h2>
          <form onSubmit={create} className="grid grid-cols-2 gap-4">
            <div><label className="label">Prénom</label><input className="input" required value={form.first_name} onChange={e => setForm(p => ({...p, first_name: e.target.value}))} /></div>
            <div><label className="label">Nom</label><input className="input" required value={form.last_name} onChange={e => setForm(p => ({...p, last_name: e.target.value}))} /></div>
            <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} /></div>
            <div><label className="label">Compétences (séparées par virgule)</label><input className="input" value={form.skills} onChange={e => setForm(p => ({...p, skills: e.target.value}))} placeholder="Plomberie, CVC, Electricite" /></div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Créer</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{['Technicien','Email','Compétences','Tickets ouverts','Statut','Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {techs.map(t => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{t.first_name} {t.last_name}</td>
                <td className="px-4 py-3 text-gray-500">{t.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(t.skills || []).map(s => <span key={s} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${parseInt(t.open_tickets) >= 5 ? 'text-red-600' : parseInt(t.open_tickets) >= 3 ? 'text-orange-500' : 'text-green-600'}`}>{t.open_tickets}</span>
                    <span className="text-xs text-gray-400">{parseInt(t.open_tickets) >= 5 ? 'Surchargé' : parseInt(t.open_tickets) >= 3 ? 'Modéré' : 'Disponible'}</span>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={t.status === 'actif' ? 'text-green-600 font-medium' : 'text-gray-400'}>{t.status}</span></td>
                <td className="px-4 py-3"><button onClick={() => toggle(t)} className="text-sm text-blue-600 hover:underline">{t.status === 'actif' ? 'Désactiver' : 'Activer'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}