import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <h2 className="modal-title">✦ New Project</h2>
        {error && <div className="error-msg" style={{marginBottom:16}}>{error}</div>}
        <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="form-group">
            <label>Project Name *</label>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              placeholder="What is this project about?" rows={3} style={{resize:'vertical'}} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data))
      .finally(() => setLoading(false));
  }, []);

  const myRole = (project) => {
    const m = project.members.find(m => m.user._id === user?._id || m.user._id === user?.id);
    return m?.role || 'Member';
  };

  return (
    <>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <h1>Projects</h1>
            <p>All your collaborative workspaces</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div style={{padding:60,textAlign:'center'}}><div className="spinner" /></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📁</div>
            <p>No projects yet</p>
            <small>Create your first project to get started</small>
            <br /><br />
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Project</button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(p => (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                  <div className="project-name">{p.name}</div>
                  <span className={`badge badge-${myRole(p).toLowerCase()}`}>{myRole(p)}</span>
                </div>
                {p.description && <div className="project-desc">{p.description}</div>}
                <div className="project-meta">
                  <span>👥 {p.members.length} member{p.members.length!==1?'s':''}</span>
                  <span>•</span>
                  <span>Created by {p.creator?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </>
  );
}
