import React from 'react';
import { LayoutDashboard, PlusCircle, LineChart, Briefcase } from 'lucide-react';

const BottomNav = ({ currentPage, setCurrentPage }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--color-border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.75rem 1rem',
      paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)'
    }}>
      <button 
        onClick={() => setCurrentPage('dashboard')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'none',
          border: 'none',
          color: currentPage === 'dashboard' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          flex: 1
        }}
      >
        <LayoutDashboard size={24} />
        <span style={{ fontSize: '0.7rem', fontWeight: currentPage === 'dashboard' ? '600' : '400' }}>Dashboard</span>
      </button>

      <button 
        onClick={() => setCurrentPage('projects')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'none',
          border: 'none',
          color: currentPage === 'projects' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          flex: 1
        }}
      >
        <Briefcase size={24} />
        <span style={{ fontSize: '0.7rem', fontWeight: currentPage === 'projects' ? '600' : '400' }}>Projects</span>
      </button>

      <button 
        onClick={() => setCurrentPage('add')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'none',
          border: 'none',
          color: currentPage === 'add' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          flex: 1
        }}
      >
        <PlusCircle size={24} />
        <span style={{ fontSize: '0.7rem', fontWeight: currentPage === 'add' ? '600' : '400' }}>Add Data</span>
      </button>

      <button 
        onClick={() => setCurrentPage('earnings')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'none',
          border: 'none',
          color: currentPage === 'earnings' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          cursor: 'pointer',
          flex: 1
        }}
      >
        <LineChart size={24} />
        <span style={{ fontSize: '0.7rem', fontWeight: currentPage === 'earnings' ? '600' : '400' }}>Earnings</span>
      </button>
    </div>
  );
};

export default BottomNav;
