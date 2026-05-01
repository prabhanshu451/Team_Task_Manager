import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, isPast, isValid } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import TaskModal from '../components/TaskModal';

const STATUS_BADGE = { 'To Do':'badge-todo','In Progress':'badge-inprogress','Done':'badge-done' };
const PRIORITY_BADGE = { Low:'badge-low', Medium:'badge-medium', High:'badge-high' };
const PIE_COLORS = ['#7c6af7','#3b82f6','#22c55e'];

// ── Add Member Modal ──────────────────────────────────────────────
function AddMemberModal({ onClose, onAdd }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await onAdd(email, role); onClose(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to add member'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <h2 className="modal-title">Add Member</h2>
        {error && <div className="error-msg" style={{marginBottom:16}}>{error}</div>}
        <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="member@example.com" required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option>Member</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Adding...':'Add Member'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────────
function TaskCard({ task, onClick }) {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due && isPast(due) && task.status !== 'Done';
  return (
    <div className="task-card" onClick={onClick}>
      <div style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:6}}>
        <div className="task-title" style={{flex:1}}>{task.title}</div>
        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
      </div>
      {task.description && <div className="task-desc">{task.description}</div>}
      <div className="task-meta">
        <span className={`badge ${STATUS_BADGE[task.status]}`}>{task.status}</span>
        {due && isValid(due) && (
          <span className={`task-due ${overdue?'overdue':''}`}>
            {overdue?'⚠':'📅'} {format(due,'MMM d')}
          </span>
        )}
        {task.assignedTo && (
          <span style={{fontSize:12,color:'var(--text3)'}}>
            👤 {task.assignedTo.name}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Dashboard Tab ─────────────────────────────────────────────────
function DashboardTab({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/dashboard?projectId=${projectId}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div style={{padding:40,textAlign:'center'}}><div className="spinner"/></div>;
  if (!data) return null;
  const { stats } = data;

  const statusData = Object.entries(stats.byStatus).map(([name,value])=>({name,value}));
  const priorityData = Object.entries(stats.byPriority).map(([name,value])=>({name,value}));
  const userDataArr = Object.entries(stats.byUser).map(([name,value])=>({name,value}));

  const statCards = [
    { label:'Total Tasks', value:stats.total, color:'var(--accent)', icon:'📋' },
    { label:'In Progress', value:stats.byStatus['In Progress'], color:'var(--blue)', icon:'⚡' },
    { label:'Completed', value:stats.byStatus['Done'], color:'var(--green)', icon:'✅' },
    { label:'Overdue', value:stats.overdue, color:'var(--red)', icon:'⚠️' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{'--stat-color':s.color}}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{color:s.color}}>{s.value}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Tasks by Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({name,value})=>`${name}: ${value}`}>
                {statusData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Tasks by Priority</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={priorityData}>
              <XAxis dataKey="name" stroke="var(--text3)" tick={{fill:'var(--text2)',fontSize:12}} />
              <YAxis stroke="var(--text3)" tick={{fill:'var(--text2)',fontSize:12}} allowDecimals={false} />
              <Tooltip contentStyle={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)'}} />
              <Bar dataKey="value" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {userDataArr.length > 0 && (
          <div className="chart-card" style={{gridColumn:'1/-1'}}>
            <div className="chart-title">Tasks per Team Member</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={userDataArr} layout="vertical">
                <XAxis type="number" stroke="var(--text3)" tick={{fill:'var(--text2)',fontSize:12}} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="var(--text3)" tick={{fill:'var(--text2)',fontSize:12}} width={120} />
                <Tooltip contentStyle={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text)'}} />
                <Bar dataKey="value" fill="var(--accent2)" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Members Tab ───────────────────────────────────────────────────
function MembersTab({ project, role, onProjectUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const { user } = useAuth();

  const addMember = async (email, memberRole) => {
    const res = await api.post(`/projects/${project._id}/members`, { email, role: memberRole });
    onProjectUpdate(res.data);
  };

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    const res = await api.delete(`/projects/${project._id}/members/${userId}`);
    onProjectUpdate(res.data);
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{fontFamily:'var(--font-head)',fontWeight:700}}>Team Members ({project.members.length})</h3>
        {role === 'Admin' && <button className="btn btn-primary btn-sm" onClick={()=>setShowAdd(true)}>+ Add Member</button>}
      </div>

      <div className="members-list">
        {project.members.map(m => {
          const isMe = m.user._id === user?._id || m.user._id === user?.id;
          const isCreator = m.user._id === project.creator?._id;
          return (
            <div key={m.user._id} className="member-row">
              <div className="avatar" style={{width:36,height:36,fontSize:14}}>
                {m.user.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2)}
              </div>
              <div className="member-info">
                <div className="member-name">{m.user.name} {isMe && <span style={{color:'var(--text3)',fontSize:12}}>(you)</span>}</div>
                <div className="member-email">{m.user.email}</div>
              </div>
              <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span>
              {role === 'Admin' && !isMe && !isCreator && (
                <div className="member-actions">
                  <button className="btn btn-danger btn-sm" onClick={()=>removeMember(m.user._id)}>Remove</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && <AddMemberModal onClose={()=>setShowAdd(false)} onAdd={addMember} />}
    </div>
  );
}

// ── Tasks Tab (Kanban) ────────────────────────────────────────────
function TasksTab({ project, role, tasks, setTasks }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const columns = [
    { status:'To Do', color:'var(--text3)' },
    { status:'In Progress', color:'var(--blue)' },
    { status:'Done', color:'var(--green)' },
  ];

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    setTasks(prev => prev.filter(t => t._id !== taskId));
  };

  const handleSave = (task, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t._id===task._id ? task : t));
    else setTasks(prev => [task, ...prev]);
  };

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div style={{color:'var(--text2)',fontSize:14}}>{tasks.length} task{tasks.length!==1?'s':''}</div>
        {role === 'Admin' && (
          <button className="btn btn-primary btn-sm" onClick={()=>setShowCreate(true)}>+ New Task</button>
        )}
      </div>

      <div className="kanban-board">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="kanban-col">
              <div className="kanban-col-header">
                <span style={{color:col.color}}>{col.status}</span>
                <span className="count">{colTasks.length}</span>
              </div>
              <div className="kanban-tasks">
                {colTasks.length === 0 && (
                  <div style={{textAlign:'center',color:'var(--text3)',fontSize:13,padding:'20px 0'}}>No tasks</div>
                )}
                {colTasks.map(task => (
                  <div key={task._id} style={{position:'relative'}}>
                    <TaskCard task={task} onClick={()=>setEditTask(task)} />
                    {role === 'Admin' && (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{position:'absolute',top:8,right:8,padding:'2px 8px',fontSize:11}}
                        onClick={e=>{e.stopPropagation();deleteTask(task._id);}}
                      >✕</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <TaskModal project={project} role={role} onClose={()=>setShowCreate(false)} onSave={handleSave} />
      )}
      {editTask && (
        <TaskModal task={editTask} project={project} role={role} onClose={()=>setEditTask(null)} onSave={handleSave} />
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');

  const fetchProject = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`)
      ]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch { navigate('/projects'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const deleteProject = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><div className="spinner"/></div>;
  if (!project) return null;

  const myMember = project.members.find(m => m.user._id === user?._id || m.user._id === user?.id);
  const role = myMember?.role || 'Member';

  return (
    <>
      <div className="page-header">
        <div style={{display:'flex',alignItems:'flex-start',gap:12,flexWrap:'wrap',justifyContent:'space-between'}}>
          <div>
            <button className="btn btn-ghost btn-sm" style={{marginBottom:8,paddingLeft:0}} onClick={()=>navigate('/projects')}>← Projects</button>
            <h1>{project.name}</h1>
            {project.description && <p>{project.description}</p>}
            <div style={{display:'flex',gap:8,marginTop:8}}>
              <span className={`badge badge-${role.toLowerCase()}`}>Your role: {role}</span>
              <span style={{fontSize:13,color:'var(--text3)'}}>👥 {project.members.length} members</span>
            </div>
          </div>
          {role === 'Admin' && (
            <button className="btn btn-danger btn-sm" onClick={deleteProject}>Delete Project</button>
          )}
        </div>
      </div>

      <div className="page-body">
        <div className="tabs">
          {['tasks','dashboard','members'].map(t => (
            <button key={t} className={`tab${tab===t?' active':''}`} onClick={()=>setTab(t)}>
              {t==='tasks'?'📋 Tasks':t==='dashboard'?'📊 Dashboard':'👥 Members'}
            </button>
          ))}
        </div>

        {tab === 'tasks' && <TasksTab project={project} role={role} tasks={tasks} setTasks={setTasks} />}
        {tab === 'dashboard' && <DashboardTab projectId={id} />}
        {tab === 'members' && <MembersTab project={project} role={role} onProjectUpdate={setProject} />}
      </div>
    </>
  );
}
