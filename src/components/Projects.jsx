import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, Briefcase, Calendar, DollarSign, Paintbrush, AlertTriangle } from 'lucide-react';

const Projects = ({ projects, setProjects, clients, setClients }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [newClient, setNewClient] = useState('');
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [deadline, setDeadline] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;

    let finalClient = client;

    if (isAddingNewClient && newClient.trim()) {
      finalClient = newClient.trim();
      if (!clients.includes(finalClient)) {
        setClients([...clients, finalClient]);
      }
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      client: finalClient,
      deadline,
      amount: parseFloat(amount) || 0,
      workPending: true,
      paymentPending: true,
      paymentCompletedDate: null
    };

    setProjects([newProject, ...projects]);
    setName('');
    setDescription('');
    setClient('');
    setNewClient('');
    setIsAddingNewClient(false);
    setDeadline('');
    setAmount('');
  };

  const handleResetProjects = () => {
    const pwd = window.prompt("WARNING: This will delete ALL Graphic Design Projects. Enter password to confirm:");
    if (pwd === 'Basi@2384') {
      setProjects([]);
    } else if (pwd !== null) {
      alert("Incorrect password.");
    }
  };

  const toggleWorkStatus = (id) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, workPending: !p.workPending } : p
    ));
  };

  const togglePaymentStatus = (id) => {
    setProjects(projects.map(p => {
      if (p.id === id) {
        const isNowPaid = p.paymentPending; // if it was pending, it is now paid
        return { 
          ...p, 
          paymentPending: !p.paymentPending,
          paymentCompletedDate: isNowPaid ? new Date().toISOString() : null
        };
      }
      return p;
    }));
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  const isThisMonth = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // Convert old projects format to new format if needed
  const normalizedProjects = projects.map(p => ({
    ...p,
    workPending: p.workPending !== undefined ? p.workPending : p.pending,
    paymentPending: p.paymentPending !== undefined ? p.paymentPending : p.pending,
    paymentCompletedDate: p.paymentCompletedDate !== undefined ? p.paymentCompletedDate : p.completedDate
  }));

  const pendingWorkCount = normalizedProjects.filter(p => p.workPending).length;
  const pendingAmount = normalizedProjects.filter(p => p.paymentPending).reduce((sum, p) => sum + (p.amount || 0), 0);
  const receivedAmountThisMonth = normalizedProjects.filter(p => !p.paymentPending && isThisMonth(p.paymentCompletedDate)).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Group projects by Month
  const groupedProjects = useMemo(() => {
    const groups = {};
    normalizedProjects.forEach(project => {
      // Extract creation date from ID or fallback
      const date = new Date(parseInt(project.id));
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(project);
    });
    return groups;
  }, [normalizedProjects]);

  return (
    <div className="card glass" style={{ marginTop: '2rem' }}>
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Graphic Design Projects</h3>
          <button onClick={handleResetProjects} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
            <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} />
            Reset
          </button>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Pending Payment</span>
            <span style={{ fontWeight: '600', color: 'var(--color-warning)' }}>${pendingAmount.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Received (This Month)</span>
            <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>${receivedAmountThisMonth.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Tasks Status</span>
            <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{pendingWorkCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Add Project Form */}
      <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            className="input-field" 
            style={{ flex: '1 1 200px' }}
            placeholder="Project Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column' }}>
            <select 
              className="input-field" 
              value={isAddingNewClient ? 'new' : client}
              onChange={(e) => {
                if (e.target.value === 'new') {
                  setIsAddingNewClient(true);
                  setClient('');
                } else {
                  setIsAddingNewClient(false);
                  setClient(e.target.value);
                }
              }}
            >
              <option value="" disabled>Select Client...</option>
              {clients.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value="new">+ Add a brand or client...</option>
            </select>
            {isAddingNewClient && (
              <input 
                className="input-field" 
                style={{ marginTop: '0.5rem' }}
                placeholder="New Client Name"
                value={newClient}
                onChange={(e) => setNewClient(e.target.value)}
                autoFocus
              />
            )}
          </div>

          <input 
            className="input-field" 
            type="number"
            step="0.01"
            style={{ flex: '0 1 120px' }}
            placeholder="Amount ($)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input 
            className="input-field" 
            type="date"
            style={{ flex: '0 1 150px' }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            className="input-field" 
            style={{ flex: '1' }}
            placeholder="Description / Notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
            <Plus size={18} /> Add Project
          </button>
        </div>
      </form>

      {/* Projects List by Month */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.keys(groupedProjects).length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No projects yet.</p>
        ) : (
          Object.entries(groupedProjects).map(([monthYear, monthProjects]) => (
            <div key={monthYear}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--color-primary-dark)', marginBottom: '1rem', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                {monthYear}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {monthProjects.map(project => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        padding: '1.25rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: (!project.workPending && !project.paymentPending) ? 'var(--color-bg)' : 'var(--color-surface)',
                        transition: 'background-color 0.2s ease',
                        opacity: (!project.workPending && !project.paymentPending) ? 0.7 : 1
                      }}
                    >
                      <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <h4 style={{ 
                            fontSize: '1.125rem', 
                            fontWeight: '600',
                            textDecoration: !project.workPending ? 'line-through' : 'none'
                          }}>
                            {project.name}
                          </h4>
                          
                          {/* Status Tags */}
                          {project.workPending ? (
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary-dark)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Work Pending</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Work Done</span>
                          )}

                          {project.paymentPending ? (
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-warning)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Payment Pending</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-success)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-full)' }}>Paid</span>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: '600', color: project.paymentPending ? 'var(--color-text-main)' : 'var(--color-success)' }}>
                            ${(project.amount || 0).toFixed(2)}
                          </span>
                          <button 
                            onClick={() => handleDelete(project.id)}
                            className="btn-icon"
                            style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        {project.description && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            {project.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-main)' }}>
                          {project.client && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Briefcase size={14} className="text-muted" /> {project.client}
                            </span>
                          )}
                          {project.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={14} className="text-muted" /> {project.deadline}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Checklists for Work and Payment */}
                      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                        <button 
                          onClick={() => toggleWorkStatus(project.id)}
                          className="btn btn-outline"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', 
                            borderColor: project.workPending ? 'var(--color-border)' : 'var(--color-success)',
                            color: project.workPending ? 'var(--color-text-main)' : 'var(--color-success)',
                            backgroundColor: project.workPending ? 'transparent' : 'rgba(16, 185, 129, 0.05)'
                          }}
                        >
                          <Paintbrush size={16} />
                          {project.workPending ? 'Mark Work as Done' : 'Work Completed'}
                        </button>

                        <button 
                          onClick={() => togglePaymentStatus(project.id)}
                          className="btn btn-outline"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem',
                            borderColor: project.paymentPending ? 'var(--color-border)' : 'var(--color-success)',
                            color: project.paymentPending ? 'var(--color-text-main)' : 'var(--color-success)',
                            backgroundColor: project.paymentPending ? 'transparent' : 'rgba(16, 185, 129, 0.05)'
                          }}
                        >
                          <DollarSign size={16} />
                          {project.paymentPending ? 'Mark Payment Received' : 'Payment Received'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Projects;
