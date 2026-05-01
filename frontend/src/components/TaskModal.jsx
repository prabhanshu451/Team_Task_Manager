import { useState } from 'react';
import api from '../api/client';

const statusOptions = ['To Do', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

export default function TaskModal({ task, project, role, onClose, onSave }) {
  const isEdit = !!task;
  const members = project?.members || [];

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'To Do',
    assignedTo: task?.assignedTo?._id || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      let res;
      const payload = { ...form, assignedTo: form.assignedTo || null };
      if (!payload.dueDate) payload.dueDate = null;

      if (isEdit) {
        // Member can only update status
        const updatePayload = role === 'Admin' ? payload : { status: form.status };
        res = await api.put(`/tasks/${task._id}`, updatePayload);
      } else {
        res = await api.post('/tasks', { ...payload, projectId: project._id });
      }
      onSave(res.data, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <h2 className="modal-title">{isEdit ? '✎ Edit Task' : '✦ New Task'}</h2>
        {error && <div className="error-msg" style={{marginBottom:16}}>{error}</div>}

        <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Admin full form / Member only status */}
          {(role === 'Admin' || !isEdit) ? (
            <>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
                  placeholder="Optional details..." rows={3} style={{resize:'vertical'}} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e=>setForm({...form,dueDate:e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                    {priorityOptions.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={form.assignedTo} onChange={e=>setForm({...form,assignedTo:e.target.value})}>
                    <option value="">Unassigned</option>
                    {members.map(m => (
                      <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
              <small style={{color:'var(--text3)',marginTop:4}}>As a member, you can only update the status.</small>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
