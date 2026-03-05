import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import Login from './pages/Login'
import ScanForm from './pages/public/ScanForm'
import ReviewForm from './pages/public/ReviewForm'

import AdminLayout from './pages/admin/Layout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminTickets from './pages/admin/Tickets'
import AdminTicketDetail from './pages/admin/TicketDetail'
import AdminTechnicians from './pages/admin/Technicians'
import AdminQRCodes from './pages/admin/QRCodes'
import AdminFaults from './pages/admin/Faults'
import AdminReviews from './pages/admin/Reviews'
import AdminSubscription from './pages/admin/Subscription'

import TechLayout from './pages/technician/Layout'
import TechDashboard from './pages/technician/Dashboard'
import TechTickets from './pages/technician/Tickets'
import TechTicketDetail from './pages/technician/TicketDetail'

import SuperLayout from './pages/superadmin/Layout'
import SuperDashboard from './pages/superadmin/Dashboard'
import SuperHotels from './pages/superadmin/Hotels'
import SuperPlans from './pages/superadmin/Plans'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/public/scan/:id" element={<ScanForm />} />
          <Route path="/public/review/:token" element={<ReviewForm />} />

          <Route path="/admin" element={<PrivateRoute roles={['Admin']}><AdminLayout /></PrivateRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="tickets/:id" element={<AdminTicketDetail />} />
            <Route path="technicians" element={<AdminTechnicians />} />
            <Route path="qrcodes" element={<AdminQRCodes />} />
            <Route path="faults" element={<AdminFaults />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="subscription" element={<AdminSubscription />} />
          </Route>

          <Route path="/technician" element={<PrivateRoute roles={['Technicien']}><TechLayout /></PrivateRoute>}>
            <Route index element={<TechDashboard />} />
            <Route path="tickets" element={<TechTickets />} />
            <Route path="tickets/:id" element={<TechTicketDetail />} />
          </Route>

          <Route path="/superadmin" element={<PrivateRoute roles={['SuperAdmin']}><SuperLayout /></PrivateRoute>}>
            <Route index element={<SuperDashboard />} />
            <Route path="hotels" element={<SuperHotels />} />
            <Route path="plans" element={<SuperPlans />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}