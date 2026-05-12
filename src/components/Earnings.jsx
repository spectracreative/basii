import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Earnings = ({ transactions }) => {
  const chartData = useMemo(() => {
    const monthMap = {};

    // Group transactions by Month/Year
    transactions.forEach(t => {
      const date = new Date(t.created_at || t.date);
      if (isNaN(date)) return;
      
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      const sortKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap[sortKey]) {
        monthMap[sortKey] = { name: monthYear, sortKey, earnings: 0, expenses: 0 };
      }

      if (t.type === 'credit') {
        monthMap[sortKey].earnings += (t.amount || 0);
      } else if (t.type === 'debit') {
        monthMap[sortKey].expenses += (t.amount || 0);
      }
    });

    // Sort chronologically and return array
    return Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions]);

  const totalEarnings = chartData.reduce((sum, data) => sum + data.earnings, 0);
  const totalExpenses = chartData.reduce((sum, data) => sum + data.expenses, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.5rem' }}>
        <div className="card glass flex-between" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Earnings (All Time)</p>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-success)' }}>₹{totalEarnings.toFixed(2)}</h3>
          </div>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp className="text-success" size={24} />
          </div>
        </div>
        
        <div className="card glass flex-between" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Total Expenses (All Time)</p>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-danger)' }}>₹{totalExpenses.toFixed(2)}</h3>
          </div>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <TrendingDown className="text-danger" size={24} />
          </div>
        </div>
        
        <div className="card glass flex-between" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div>
            <p className="text-muted" style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>Net Profit</p>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>₹{(totalEarnings - totalExpenses).toFixed(2)}</h3>
          </div>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-secondary)' }}>
            <DollarSign className="text-primary-dark" size={24} />
          </div>
        </div>
      </div>

      <div className="card glass" style={{ minHeight: '500px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '2rem' }}>Monthly Cash Flow</h3>
        
        {chartData.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '4rem 0' }}>No transaction data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fontSize: 12, fill: 'var(--color-text-muted)'}} />
              <Tooltip formatter={(val) => `₹${val}`} cursor={{stroke: 'var(--color-border)', strokeWidth: 1}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line type="monotone" dataKey="earnings" name="Earnings (Credits)" stroke="var(--color-success)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses (Debits)" stroke="var(--color-danger)" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

export default Earnings;
