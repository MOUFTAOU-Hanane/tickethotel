import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function AdminTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [techs, setTechs] = useState([])
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => api.get(`/tickets/${id}`).then(r => { setTicket(r.data); setLoading(false) })
  useEffect(() => { load(); api.get('/users').then(r => setTechs(r.data.filter(u => u.role === 'Technicien'))) }, [id])

  const updateStatus = async (status) => { await api.patch(`/tickets/${id}`, { status }); load() }
  const assign = async (tech_id) => { await api.patch(`/tickets/${id}`, { assigned_to: tech_id, status: 'IN_PROGRESS' }); load() }
  const aiAssign = async () => { await api.post(`/tickets/${id}/ai-assign`); load() }
  const sendComment = async () => { if (!comment.trim()) return; await api.post(`/tickets/${id}/comments`, { content: comment }); setComment(''); load() }

  if (loading) return <div className="p-6 text-gray-400">Chargement...</div>
  if (!ticket) return <div className="p-6 text-red-500">Ticket non trouvé</div>

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">← Retour</button>
        <h1 className="text-xl font-bold text-gray-800">{ticket.reference}</h1>
        <span className={`badge-${ticket.status}`}>{ticket.status}</span>
        <span className={`badge-${ticket.priority}`}>{ticket.priority}</span>
        {ticket.assigned_by_ai && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">🤖 Assigné par IA</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-semibold mb-2">{ticket.title}</h2>
            <p className="text-gray-600 text-sm">{ticket.description || 'Pas de description'}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
              <span>📍 {ticket.scan_point_name || '—'}</span>
              <span>🏷️ {ticket.category_name || '—'}</span>
              <span>📅 {new Date(ticket.created_at).toLocaleString('fr')}</span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Historique</h3>
            <div className="space-y-2">
              {ticket.history?.map(h => (
                <div key={h.id} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs mt-0.5 w-32 shrink-0">{new Date(h.created_at).toLocaleString('fr')}</span>
                  <span className="text-gray-600">{h.action}</span>
                  {h.assigned_by_ai && <span className="text-xs text-purple-600">🤖</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Commentaires</h3>
            <div className="space-y-3 mb-4">
              {ticket.comments?.map(c => (
                <div key={c.id} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">{c.author_name} · {new Date(c.created_at).toLocaleString('fr')}</p>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              ))}
              {!ticket.comments?.length && <p className="text-gray-400 text-sm">Aucun commentaire</p>}
            </div>
            <div className="flex gap-2">
              <input className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Ajouter un commentaire..." onKeyDown={e => e.key === 'Enter' && sendComment()} />
              <button onClick={sendComment} className="btn-primary shrink-0">Envoyer</button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold mb-3">Client</h3>
            <p className="text-sm font-medium">{ticket.client_name || '—'}</p>
            <p className="text-sm text-gray-500">{ticket.client_email || '—'}</p>
            <p className="text-sm text-gray-500">{ticket.client_phone || '—'}</p>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">Technicien</h3>
            <p className="text-sm text-gray-600 mb-3">{ticket.technician_name || 'Non assigné'}</p>
            <select className="input mb-2" onChange={e => e.target.value && assign(e.target.value)} defaultValue="">
              <option value="">Assigner manuellement</option>
              {techs.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
            </select>
            <button onClick={aiAssign} className="btn-teal w-full text-sm">🤖 Assigner par IA</button>
          </div>

          <div className="card space-y-2">
            <h3 className="font-semibold mb-3">Actions</h3>
            {['IN_PROGRESS','RESOLVED','CLOSED'].map(s => (
              <button key={s} onClick={() => updateStatus(s)} className="btn-secondary w-full text-sm">
                → {s}
              </button>
            ))}
            <button onClick={() => navigate(`/admin/tickets/${id}/escalate`)} className="btn-danger w-full text-sm">⬆️ Escalader</button>
          </div>
        </div>
      </div>
    </div>
  )
}