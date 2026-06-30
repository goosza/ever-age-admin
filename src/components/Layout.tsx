import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/layout.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">Ever Age Admin</div>
        <nav className="sidebar-nav">
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/items">Items</NavLink>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
