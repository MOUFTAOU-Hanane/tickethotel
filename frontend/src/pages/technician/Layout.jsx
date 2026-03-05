import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function TechLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-teal-900 text-white flex flex-col">
        <div className="p-6 border-b border-teal-800">
          <h1 className="text-xl font-bold">🏨 TicketHotel</h1>
          <p className="text-teal-300 text-sm mt-1">Espace Technicien</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{to:'/technician',label:'📊 Dashboard',end:true},{to:'/technician/tickets',label:'🎫 Mes Tickets'}].map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-teal-700 text-white' : 'text-teal-200 hover:bg-teal-800'}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-teal-800">
          <p className="text-teal-300 text-xs mb-2">{user?.firstName} {user?.lastName}</p>
          <button onClick={() => { logout(); navigate('/login') }} className="text-teal-300 hover:text-white text-sm">← Déconnexion</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  )
}