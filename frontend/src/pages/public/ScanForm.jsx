import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function ScanForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', client_name: '', client_email: '', client_phone: '', category_id: '', predefined_fault_id: '' })

  useEffect(() => {
    api.get(`/public/scan/${id}`).then(r => { setData(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const selectFault = (f) => setForm(p => ({ ...p, title: f.name, predefined_fault_id: f.id, category_id: f.category_id }))

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      const payload = { ...form, scan_point_id: id, hotel_id: data.scan_point.hotel_id }
      const r = await api.post('/tickets', payload)
      setDone(r.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la soumission')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-gray-500">Chargement...</p></div>
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-red-500">Point de scan introuvable ou inactif.</p></div>

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bien reçu !</h2>
        <p className="text-gray-500 mb-4">Votre signalement a été enregistré.</p>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500">Référence</p>
          <p className="text-2xl font-bold text-blue-700">{done.reference}</p>
        </div>
        <p className="text-sm text-gray-400">Un technicien va prendre en charge votre demande rapidement.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-r from-blue-700 to-teal-600 rounded-2xl p-6 text-white mb-6">
          <h1 className="text-xl font-bold">🏨 {data.scan_point.hotel_name}</h1>
          <p className="text-blue-100 mt-1">📍 {data.scan_point.name}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {data.faults.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-700 mb-3">Quel est le problème ?</h3>
              <div className="flex flex-wrap gap-2">
                {data.faults.map(f => (
                  <button key={f.id} type="button" onClick={() => selectFault(f)}
                    className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${form.predefined_fault_id === f.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}>
                    {f.name}
                  </button>
                ))}
                <button type="button" onClick={() => setForm(p => ({ ...p, predefined_fault_id: '', title: '' }))}
                  className={`px-3 py-2 rounded-full text-sm font-medium border transition-all ${!form.predefined_fault_id ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-700 border-gray-200'}`}>
                  Autre
                </button>
              </div>
            </div>
          )}

          <div className="card space-y-4">
            {!form.predefined_fault_id && (
              <div>
                <label className="label">Titre du problème *</label>
                <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Fuite d'eau dans la salle de bain" required />
              </div>
            )}
            <div>
              <label className="label">Description (optionnel)</label>
              <textarea className="input" rows="3" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Décrivez le problème..." />
            </div>
          </div>

          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700">Vos coordonnées</h3>
            <div>
              <label className="label">Votre nom</label>
              <input className="input" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} placeholder="Nom Prénom" />
            </div>
            <div>
              <label className="label">Email (pour le suivi)</label>
              <input className="input" type="email" value={form.client_email} onChange={e => setForm(p => ({ ...p, client_email: e.target.value }))} placeholder="votre@email.com" />
            </div>
            <div>
              <label className="label">Téléphone</label>
              <input className="input" type="tel" value={form.client_phone} onChange={e => setForm(p => ({ ...p, client_phone: e.target.value }))} placeholder="+33 6 00 00 00 00" />
            </div>
          </div>

          <button type="submit" disabled={submitting || !form.title} className="btn-primary w-full py-4 text-base font-semibold rounded-xl">
            {submitting ? 'Envoi en cours...' : '📤 Signaler le problème'}
          </button>
        </form>
      </div>
    </div>
  )
}