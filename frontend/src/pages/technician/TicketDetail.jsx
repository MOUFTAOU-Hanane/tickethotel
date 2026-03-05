import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function TechTicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [comment, setComment] = useState('')

  const load = () => api.get(`/tickets/${id}`).then(r => setTicket(r.data))
  useEffect(() => { load() }, [id])

  const updateStatus = async (status) => { await api.patch(`/tickets/${id}`, { status }); load() }
  const sendComment = async () => { if (!comment.trim()) return; await api.post(`/tickets/${id}/comments`, { content: comment }); setComment(''); load() }

  if (!ticket) return <div className="p-6 text-gray-400">Chargement...</div>

  return (
    <div className="p-6 max-w-2xl space-y-4">
      <button onClick={() => navigate(-1)} className="btn-secondary">← Retour</button>
      <div className="card">
        <div className="flex items-center gap-2 mb-3"><span className={`badge-${ticket.status}`}>{ticket.status}</span><span className={`badge-${ticket.priority}`}>{ticket.priority}</span></div>
        <h1 className="text-xl font-bold mb-2">{ticket.title}</h1>
        <p className="text-gray-600 text-sm mb-4">{ticket.description}</p>
        <div className="text-sm text-gray-500 space-y-1">
          <p>📍 {ticket.scan_point_name}</p>
          <p>👤 Client : {ticket.client_name} — {ticket.client_email}</p>
          <p>📅 {new Date(ticket.created_at).toLocaleString('fr')}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {ticket.status === 'OPEN' && <button onClick={() => updateStatus('IN_PROGRESS')} className="btn-teal">▶ Prendre en charge</button>}
        {ticket.status === 'IN_PROGRESS' && <button onClick={() => updateStatus('RESOLVED')} className="btn-primary">✅ Marquer résolu</button>}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Commentaires</h3>
        <div className="space-y-2 mb-3">
          {ticket.comments?.map(c => (
            <div key={c.id} className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">{c.author_name} · {new Date(c.created_at).toLocaleString('fr')}</p>
              <p className="text-sm">{c.content}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input" value={comment} onChange={e => setComment(e.target.value)} placeholder="Ajouter une note..." onKeyDown={e => e.key === 'Enter' && sendComment()} />
          <button onClick={sendComment} className="btn-primary shrink-0">Envoyer</button>
        </div>
      </div>
    </div>
  )
}