import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle, Circle, Briefcase, Calendar, DollarSign, Paintbrush, AlertTriangle, Printer } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { printProjectBill } from '../utils/billPrint';

const Projects = ({ projects, setProjects, clients, setClients, session, selectedMonth, onPaymentReceived }) => {
  const handleResetProjects = async () => {
    const pwd = window.prompt("WARNING: This will delete ALL Graphic Design Projects. Enter 'DELETE' to confirm:");
    if (pwd === 'DELETE') {
      try {
        const { error } = await supabase.from('projects').delete().eq('user_id', session.user.id);
        if (error) throw error;
        setProjects([]);
      } catch (error) {
        console.error('Error resetting projects:', error);
      }
    }
  };

  const toggleWorkStatus = async (id, currentPending, currentDelivery) => {
    const isNowDone = currentPending;
    const newDeliveryDate = isNowDone ? new Date().toISOString().split('T')[0] : currentDelivery;
    
    try {
      const { error } = await supabase.from('projects')
        .update({ workPending: !currentPending, deliveryDate: newDeliveryDate })
        .eq('id', id);
      if (error) throw error;
      
      setProjects(projects.map(p => 
        p.id === id ? { ...p, workPending: !currentPending, deliveryDate: newDeliveryDate } : p
      ));
    } catch (error) {
      console.error('Error updating work status:', error);
    }
  };

  const updateDeliveryDate = async (id, date) => {
    try {
      const { error } = await supabase.from('projects').update({ deliveryDate: date }).eq('id', id);
      if (error) throw error;
      setProjects(projects.map(p => p.id === id ? { ...p, deliveryDate: date } : p));
    } catch (error) {
      console.error('Error updating delivery date:', error);
    }
  };

  const togglePaymentStatus = async (id, currentPending) => {
    // Find the project first to check work status
    const project = projects.find(p => p.id === id);
    if (project && project.workPending && currentPending) {
      alert("You must mark the work as 'Completed' before you can log a payment!");
      return;
    }

    const isNowPaid = currentPending;
    const newDate = isNowPaid ? new Date().toISOString() : null;

    try {
      const { error } = await supabase.from('projects')
        .update({ paymentPending: !currentPending, paymentCompletedDate: newDate })
        .eq('id', id);
      if (error) throw error;

      setProjects(projects.map(p => 
        p.id === id ? { ...p, paymentPending: !currentPending, paymentCompletedDate: newDate } : p
      ));

      if (isNowPaid && onPaymentReceived && project) {
        onPaymentReceived(project);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
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
  const pendingAmount = normalizedProjects.filter(p => p.paymentPending && !p.workPending).reduce((sum, p) => sum + (p.amount || 0), 0);
  const receivedAmountThisMonth = normalizedProjects.filter(p => !p.paymentPending && !p.workPending && isThisMonth(p.paymentCompletedDate)).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Group projects by Month
  const groupedProjects = useMemo(() => {
    const groups = {};
    normalizedProjects.forEach(project => {
      // Use Supabase created_at, or fallback to parsing the ID for old local storage data
      let date;
      if (project.created_at) {
        date = new Date(project.created_at);
      } else {
        date = new Date(parseInt(project.id) || Date.now());
      }
      
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
            <span style={{ fontWeight: '600', color: 'var(--color-warning)' }}>₹{pendingAmount.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Received (This Month)</span>
            <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>₹{receivedAmountThisMonth.toFixed(2)}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block' }}>Tasks Status</span>
            <span style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{pendingWorkCount} Pending</span>
          </div>
        </div>
      </div>

      {/* Projects List by Month */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.keys(groupedProjects).length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No projects yet.</p>
        ) : (
          Object.entries(groupedProjects)
            .filter(([monthYear]) => !selectedMonth || selectedMonth === 'All Time' || monthYear === selectedMonth)
            .map(([monthYear, monthProjects]) => (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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
                            ₹{(project.amount || 0).toFixed(2)}
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
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-main)', flexWrap: 'wrap' }}>
                          {project.client && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Briefcase size={14} className="text-muted" /> {project.client}
                            </span>
                          )}
                          {project.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Calendar size={14} className="text-muted" /> Deadline: {project.deadline}
                            </span>
                          )}
                          {!project.workPending && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <CheckCircle size={14} /> Delivered:
                              </span>
                              <input 
                                type="date"
                                className="input-field"
                                style={{ padding: '0.1rem 0.5rem', fontSize: '0.75rem', width: 'auto', backgroundColor: 'transparent', border: '1px dashed var(--color-border)' }}
                                value={project.deliveryDate || ''}
                                onChange={(e) => updateDeliveryDate(project.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Checklists for Work and Payment */}
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                        <button 
                          onClick={() => toggleWorkStatus(project.id, project.workPending, project.deliveryDate)}
                          className="btn btn-outline"
                          style={{ flex: '1 1 150px', display: 'flex', justifyContent: 'center', gap: '0.5rem', 
                            borderColor: project.workPending ? 'var(--color-border)' : 'var(--color-success)',
                            color: project.workPending ? 'var(--color-text-main)' : 'var(--color-success)',
                            backgroundColor: project.workPending ? 'transparent' : 'rgba(16, 185, 129, 0.05)'
                          }}
                        >
                          <Paintbrush size={16} />
                          {project.workPending ? 'Mark Work as Done' : 'Work Completed'}
                        </button>

                        <button 
                          onClick={() => togglePaymentStatus(project.id, project.paymentPending)}
                          className="btn btn-outline"
                          style={{ flex: '1 1 150px', display: 'flex', justifyContent: 'center', gap: '0.5rem',
                            borderColor: project.paymentPending ? 'var(--color-border)' : 'var(--color-success)',
                            color: project.paymentPending ? 'var(--color-text-main)' : 'var(--color-success)',
                            backgroundColor: project.paymentPending ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                            opacity: (project.workPending && project.paymentPending) ? 0.5 : 1,
                            cursor: (project.workPending && project.paymentPending) ? 'not-allowed' : 'pointer'
                          }}
                          title={project.workPending && project.paymentPending ? "Complete work first" : ""}
                        >
                          <DollarSign size={16} />
                          {project.paymentPending ? 'Mark Payment Received' : 'Payment Received'}
                        </button>

                        <button
                          onClick={() => printProjectBill(project)}
                          className="btn btn-outline"
                          style={{ flex: '1 1 120px', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
                          title="Print / Save as PDF"
                        >
                          <Printer size={16} />
                          Print Bill
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
