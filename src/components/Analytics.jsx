import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Briefcase, Activity } from 'lucide-react';

const COLORS = ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0', '#047857'];

const Analytics = ({ projects, transactions }) => {
  // 1. Calculate Project Distribution by Client
  const clientData = useMemo(() => {
    const counts = {};
    projects.forEach(p => {
      const client = p.client ? p.client.trim() : 'Unknown';
      if (!client) return;
      counts[client] = (counts[client] || 0) + 1;
    });
    
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [projects]);

  // 2. Calculate Financial Overview (Credits vs Debits)
  const financialData = useMemo(() => {
    const credits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const debits = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'Credits', amount: credits, fill: 'var(--color-success)' },
      { name: 'Debits', amount: debits, fill: 'var(--color-danger)' }
    ];
  }, [transactions]);

  // 3. Calculate Project Finances (Pending vs Received)
  const projectFinanceData = useMemo(() => {
    const pendingAmount = projects.filter(p => p.pending).reduce((sum, p) => sum + (p.amount || 0), 0);
    const receivedAmount = projects.filter(p => !p.pending).reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { name: 'Pending Work', amount: pendingAmount, fill: 'var(--color-warning)' },
      { name: 'Received Work', amount: receivedAmount, fill: 'var(--color-success)' }
    ];
  }, [projects]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
      
      {/* Client Work Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card glass" 
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Briefcase className="text-primary" size={20} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Work by Company</h3>
        </div>
        
        {clientData.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>No clients added yet.</p>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {clientData.map((client, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'var(--color-bg)', 
                  padding: '0.5rem 1rem', 
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontWeight: '500'
                }}>
                  {client.name} - <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{client.value}</span>
                </div>
              ))}
            </div>
            
            <div style={{ flex: 1, minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </motion.div>

      {/* Financial Overview Graphs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card glass"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Activity className="text-primary" size={20} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Financial Overview</h3>
        </div>
        
        <div style={{ height: '200px', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>Transactions (Credits vs Debits)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(val) => `$${val}`} cursor={{fill: 'transparent'}} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ height: '200px' }}>
          <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'center' }}>Graphic Design Work (Pending vs Received)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectFinanceData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(val) => `$${val}`} cursor={{fill: 'transparent'}} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                {projectFinanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </motion.div>

    </div>
  );
};

export default Analytics;
