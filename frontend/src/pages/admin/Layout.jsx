import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/tickets', label: '🎫 Incidents' },
  { to: '/admin/technicians', label: '👷 Techniciens' },
  { to: '/admin/qrcodes', label: '📱 QR Codes' },
  { to: '/admin/faults', label: '⚠️ Pannes' },
  { to: '/admin/reviews', label: '⭐ Avis Clients' },
  { to: '/admin/subscription', label: '💳 Abonnement' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-xl font-bold">🏨 TicketHotel</h1>
          <p className="text-blue-300 text-sm mt-1">{user?.hotelName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-blue-800">
          <p className="text-blue-300 text-xs mb-2">{user?.firstName} {user?.lastName}</p>
          <button onClick={handleLogout} className="text-blue-300 hover:text-white text-sm">← Déconnexion</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}