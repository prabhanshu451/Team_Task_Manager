import { Outlet, useNavigate, useParams, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div className="page-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-text">TeamFlow</div>
          <div className="logo-sub">Task Manager</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">Main</div>
            <NavLink to="/projects" className={({isActive})=>`nav-item${isActive?' active':''}`}>
              <span className="nav-icon">📁</span> Projects
            </NavLink>
          </div>

          {projects.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title">Recent Projects</div>
              {projects.slice(0, 6).map(p => (
                <NavLink key={p._id} to={`/projects/${p._id}`} className={({isActive})=>`nav-item${isActive?' active':''}`}>
                  <span className="nav-icon">◈</span>
                  <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip" onClick={handleLogout} title="Click to logout">
            <div className="avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">Logout →</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
