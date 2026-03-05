import { useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'

export default function ReviewForm() {
  const { token } = useParams()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await api.post('/reviews', { token, rating, comment })
      setDone(true)
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la soumission')
    } finally { setSubmitting(false) }
  }

  if (done) return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="text-6xl mb-4">🙏</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Merci pour votre avis !</h2>
        <p className="text-gray-500">Votre retour nous aide à améliorer nos services.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Votre avis</h1>
        <p className="text-gray-500 mb-6">Comment s'est passée votre intervention ?</p>
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="label">Note *</label>
            <div className="flex gap-2 mt-2">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-3xl transition-transform hover:scale-110 ${n <= rating ? 'opacity-100' : 'opacity-30'}`}>
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Commentaire (optionnel)</label>
            <textarea className="input" rows="4" value={comment} onChange={e => setComment(e.target.value)} placeholder="Partagez votre expérience..." />
          </div>
          <button type="submit" disabled={!rating || submitting} className="btn-primary w-full py-3">
            {submitting ? 'Envoi...' : 'Envoyer mon avis'}
          </button>
        </form>
      </div>
    </div>
  )
}