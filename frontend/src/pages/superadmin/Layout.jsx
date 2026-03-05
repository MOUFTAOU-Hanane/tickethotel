import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SuperLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">🏨 TicketHotel</h1>
          <p className="text-gray-400 text-sm mt-1">Super Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{to:'/superadmin',label:'📊 Dashboard',end:true},{to:'/superadmin/hotels',label:'🏨 Hôtels'},{to:'/superadmin/plans',label:'💳 Plans'}].map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-gray-700' : 'text-gray-300 hover:bg-gray-800'}`}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => { logout(); navigate('/login') }} className="text-gray-400 hover:text-white text-sm">← Déconnexion</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  )
}