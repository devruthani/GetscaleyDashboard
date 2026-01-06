import { Routes, Route } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Home from '../pages/Home.jsx'
import Analytics from '../pages/Analytics.jsx'
import Users from '../pages/Users.jsx'
import Settings from '../pages/Settings.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

