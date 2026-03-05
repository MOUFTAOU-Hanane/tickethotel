import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function AdminQRCodes() {
  const [points, setPoints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', type:'Chambre', floor:'', wing:'' })
  const [qrModal, setQrModal] = useState(null)

  const load = () => api.get('/scan-points').then(r => setPoints(r.data))
  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    await api.post('/scan-points', form)
    setForm({ name:'', type:'Chambre', floor:'', wing:'' }); setShowForm(false); load()
  }

  const toggle = async (id) => { await api.patch(`/scan-points/${id}/toggle`); load() }

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">QR Codes ({points.length})</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Nouveau QR Code</button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="font-semibold mb-4">Nouveau point de scan</h2>
          <form onSubmit={create} className="grid grid-cols-2 gap-4">
            <div><label className="label">Nom</label><input className="input" required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Chambre 101" /></div>
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}>
                <option>Chambre</option><option>Zone</option><option>Salle</option>
              </select>
            </div>
            <div><label className="label">Étage</label><input className="input" value={form.floor} onChange={e => setForm(p => ({...p, floor: e.target.value}))} placeholder="1er Étage" /></div>
            <div><label className="label">Aile</label><input className="input" value={form.wing} onChange={e => setForm(p => ({...p, wing: e.target.value}))} placeholder="Aile Nord" /></div>
            <div className="col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Créer + Générer QR</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {points.map(p => (
          <div key={p.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <p className="text-xs text-gray-400">{p.type} · {p.floor}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">🎫 {p.ticket_count} signalement(s)</p>
            {p.qr_code_url && (
              <img src={p.qr_code_url} alt="QR Code" className="w-24 h-24 mb-3 cursor-pointer border rounded" onClick={() => setQrModal(p)} />
            )}
            <div className="flex gap-2">
              <button onClick={() => toggle(p.id)} className={`text-sm px-3 py-1 rounded ${p.status === 'actif' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                {p.status === 'actif' ? 'Désactiver' : 'Activer'}
              </button>
              {p.qr_code_url && <button onClick={() => setQrModal(p)} className="btn-secondary text-sm">Voir QR</button>}
            </div>
          </div>
        ))}
      </div>

      {qrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setQrModal(null)}>
          <div className="bg-white rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-4">{qrModal.name}</h3>
            <img src={qrModal.qr_code_url} alt="QR Code" className="w-64 h-64 mx-auto" />
            <p className="text-sm text-gray-400 mt-4">Imprimez ce QR code et collez-le dans {qrModal.name}</p>
            <button onClick={() => setQrModal(null)} className="btn-secondary mt-4">Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}