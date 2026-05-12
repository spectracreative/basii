import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = ({ transactions, selectedMonth }) => {
  const filteredTransactions = React.useMemo(() => {
    if (!selectedMonth || selectedMonth === 'All Time') return transactions;
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const credits = filteredTransactions.filter(t => t.type === 'credit').reduce((acc, t) => acc + t.amount, 0);
  const debits = filteredTransactions.filter(t => t.type === 'debit').reduce((acc, t) => acc + t.amount, 0);
  const balance = credits - debits;

  return (
    <div className="grid-cols-3">
      {/* Total Balance Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card glass"
      >
        <div className="flex-between">
          <div>
            <span className="label">Total Balance</span>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: balance >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
              ₹{balance.toFixed(2)}
            </h2>
          </div>
          <div className="btn-icon" style={{ backgroundColor: 'var(--color-secondary)' }}>
            <Wallet size={24} className="text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Credits Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card glass"
      >
        <div className="flex-between">
          <div>
            <span className="label">Total Credits</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              ₹{credits.toFixed(2)}
            </h2>
          </div>
          <div className="btn-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <TrendingUp size={24} className="text-success" />
          </div>
        </div>
      </motion.div>

      {/* Debits Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card glass"
      >
        <div className="flex-between">
          <div>
            <span className="label">Total Debits</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
              ₹{debits.toFixed(2)}
            </h2>
          </div>
          <div className="btn-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <TrendingDown size={24} className="text-danger" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
