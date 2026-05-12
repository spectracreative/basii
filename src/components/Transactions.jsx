import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Transactions = ({ transactions, setTransactions, session, selectedMonth }) => {
  const filteredTransactions = React.useMemo(() => {
    if (!selectedMonth || selectedMonth === 'All Time') return transactions;
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }, [transactions, selectedMonth]);

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };

  return (
    <div className="card glass" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Transactions</h3>
      
      {/* Transaction List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredTransactions.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '2rem 0' }}>No transactions yet.</p>
        ) : (
          <AnimatePresence>
            {filteredTransactions.map(t => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)'
                }}
              >
                <div>
                  <p style={{ fontWeight: '500' }}>{t.desc}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{t.date}</p>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                  <span style={{ 
                    fontWeight: '600', 
                    color: t.type === 'credit' ? 'var(--color-success)' : 'var(--color-text-main)' 
                  }}>
                    {t.type === 'credit' ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </span>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="btn-icon"
                    style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Transactions;
