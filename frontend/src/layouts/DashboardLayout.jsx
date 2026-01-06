import { NavLink, Outlet } from 'react-router-dom'

// Basic dashboard chrome with a sidebar
export default function DashboardLayout() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: '1rem' }}>
        <h2>GetScaley</h2>
        <nav style={{ display: 'grid', gap: '0.5rem' }}>
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </aside>
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  )
}

