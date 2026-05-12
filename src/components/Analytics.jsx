import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Briefcase, Activity } from 'lucide-react';

const COLORS = ['#10B981', '#34D399', '#059669', '#6EE7B7', '#A7F3D0', '#047857'];

const Analytics = ({ projects, transactions, selectedMonth }) => {
  const filteredProjects = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'All Time') return projects;
    return projects.filter(p => {
      const date = p.created_at ? new Date(p.created_at) : new Date(parseInt(p.id));
      return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [projects, selectedMonth]);

  const filteredTransactions = useMemo(() => {
    if (!selectedMonth || selectedMonth === 'All Time') return transactions;
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  // 1. Calculate Project Distribution by Client
  const clientData = useMemo(() => {
    const dataMap = {};
    filteredProjects.forEach(p => {
      const client = p.client ? p.client.trim() : 'Unknown';
      if (!client) return;
      if (!dataMap[client]) dataMap[client] = { name: client, count: 0, revenue: 0, received: 0, pending: 0 };
      dataMap[client].count += 1;
      dataMap[client].revenue += (p.amount || 0);
      const isActuallyReceived = !p.paymentPending && !p.workPending;
      const isPendingPayment = p.paymentPending && !p.workPending;
      
      if (isActuallyReceived) {
        dataMap[client].received += (p.amount || 0);
      } else if (isPendingPayment) {
        dataMap[client].pending += (p.amount || 0);
      }
    });
    
    // Sort by total revenue
    return Object.values(dataMap).sort((a, b) => b.revenue - a.revenue);
  }, [filteredProjects]);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass" style={{ padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontWeight: '600', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>{data.name}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Projects: {data.count}</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: '600' }}>Revenue: ₹{data.revenue.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  // 2. Calculate Financial Overview (Credits vs Debits)
  const financialData = useMemo(() => {
    const credits = filteredTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const debits = filteredTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'Credits', amount: credits, fill: 'var(--color-success)' },
      { name: 'Debits', amount: debits, fill: 'var(--color-danger)' }
    ];
  }, [filteredTransactions]);

  // 3. Calculate Project Finances (Pending vs Received)
  const projectFinanceData = useMemo(() => {
    const isActuallyReceived = (p) => !p.paymentPending && !p.workPending;
    const isPendingPayment = (p) => p.paymentPending && !p.workPending;
    
    const pendingAmount = filteredProjects.filter(p => isPendingPayment(p)).reduce((sum, p) => sum + (p.amount || 0), 0);
    const receivedAmount = filteredProjects.filter(p => isActuallyReceived(p)).reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { name: 'Pending Payment', amount: pendingAmount, fill: 'var(--color-warning)' },
      { name: 'Received Payment', amount: receivedAmount, fill: 'var(--color-success)' }
    ];
  }, [filteredProjects]);

  // 4. Calculate Project Workflow (Pending Work vs Completed Work)
  const projectWorkData = useMemo(() => {
    const pendingWorkAmount = filteredProjects.filter(p => p.workPending).reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedWorkAmount = filteredProjects.filter(p => !p.workPending).reduce((sum, p) => sum + (p.amount || 0), 0);

    return [
      { name: 'Pending Work', amount: pendingWorkAmount, fill: 'var(--color-danger)' },
      { name: 'Completed Work', amount: completedWorkAmount, fill: 'var(--color-success)' }
    ];
  }, [filteredProjects]);

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
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span style={{ color: 'var(--color-text-main)' }}>{client.name}</span>
                  <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>₹{client.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
            
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientData} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <Tooltip formatter={(val) => `₹${val}`} cursor={{fill: 'var(--color-bg)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="received" name="Received Payment" fill="var(--color-success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="pending" name="Pending Payment" fill="var(--color-warning)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', flex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'center' }}>Transactions</h4>
            <div style={{ flex: 1, minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <Tooltip formatter={(val) => `₹${val}`} cursor={{fill: 'var(--color-bg)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'center' }}>Project Payments</h4>
            <div style={{ flex: 1, minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectFinanceData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <Tooltip formatter={(val) => `₹${val}`} cursor={{fill: 'var(--color-bg)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {projectFinanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem', textAlign: 'center' }}>Project Workflow</h4>
            <div style={{ flex: 1, minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectWorkData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
                  <Tooltip formatter={(val) => `₹${val}`} cursor={{fill: 'var(--color-bg)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                    {projectWorkData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </motion.div>

    </div>
  );
};

export default Analytics;
