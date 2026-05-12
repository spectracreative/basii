import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { supabase } from '../utils/supabase';

const AddData = ({ 
  session, 
  transactions, setTransactions, 
  projects, setProjects, 
  clients, setClients 
}) => {
  // Transaction Form State
  const [txnDesc, setTxnDesc] = useState('');
  const [txnAmount, setTxnAmount] = useState('');
  const [txnType, setTxnType] = useState('debit');

  // Project Form State
  const [projName, setProjName] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projNewClient, setProjNewClient] = useState('');
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [projDeadline, setProjDeadline] = useState('');
  const [projAmount, setProjAmount] = useState('');

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!txnDesc || !txnAmount) return;

    const newTxn = {
      user_id: session.user.id,
      desc: txnDesc,
      amount: parseFloat(txnAmount),
      type: txnType,
      date: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('transactions').insert([newTxn]).select();
      if (error) throw error;
      if (data && data[0]) {
        setTransactions([data[0], ...transactions]);
      }
      alert('Transaction added successfully!');
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }

    setTxnDesc('');
    setTxnAmount('');
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projName) return;

    let finalClient = projClient;

    if (isAddingNewClient && projNewClient.trim()) {
      finalClient = projNewClient.trim();
      if (!clients.includes(finalClient)) {
        try {
          await supabase.from('clients').insert([{ user_id: session.user.id, name: finalClient }]);
          setClients([...clients, finalClient]);
        } catch (error) {
          console.error('Error adding client:', error);
        }
      }
    }

    const newProject = {
      user_id: session.user.id,
      name: projName,
      description: projDescription,
      client: finalClient,
      deadline: projDeadline,
      amount: parseFloat(projAmount) || 0,
      workPending: true,
      paymentPending: true,
      paymentCompletedDate: null
    };

    try {
      const { data, error } = await supabase.from('projects').insert([newProject]).select();
      if (error) throw error;
      if (data && data[0]) {
        setProjects([data[0], ...projects]);
      }
      alert('Project added successfully!');
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Failed to add project');
    }

    setProjName('');
    setProjDescription('');
    setProjClient('');
    setProjNewClient('');
    setIsAddingNewClient(false);
    setProjDeadline('');
    setProjAmount('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div className="card glass">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Add Transaction</h3>
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            className="input-field" 
            style={{ flex: '1 1 200px' }}
            placeholder="Description (e.g. Salary, Groceries)"
            value={txnDesc}
            onChange={(e) => setTxnDesc(e.target.value)}
          />
          <input 
            className="input-field" 
            style={{ flex: '1 1 120px' }}
            type="number"
            step="0.01"
            placeholder="Amount (₹)"
            value={txnAmount}
            onChange={(e) => setTxnAmount(e.target.value)}
          />
          <select 
            className="input-field" 
            style={{ flex: '0 1 150px' }}
            value={txnType}
            onChange={(e) => setTxnType(e.target.value)}
          >
            <option value="credit">Credit (+)</option>
            <option value="debit">Debit (-)</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ flex: '0 1 auto' }}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="card glass">
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '600' }}>Add Graphic Design Project</h3>
        <form onSubmit={handleAddProject} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input 
              className="input-field" 
              style={{ flex: '1 1 200px' }}
              placeholder="Project Name *"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              required
            />
            
            <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column' }}>
              <select 
                className="input-field" 
                value={isAddingNewClient ? 'new' : projClient}
                onChange={(e) => {
                  if (e.target.value === 'new') {
                    setIsAddingNewClient(true);
                    setProjClient('');
                  } else {
                    setIsAddingNewClient(false);
                    setProjClient(e.target.value);
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
                  value={projNewClient}
                  onChange={(e) => setProjNewClient(e.target.value)}
                  autoFocus
                />
              )}
            </div>

            <input 
              className="input-field" 
              type="number"
              step="0.01"
              style={{ flex: '0 1 120px' }}
              placeholder="Amount (₹)"
              value={projAmount}
              onChange={(e) => setProjAmount(e.target.value)}
            />
            <input 
              className="input-field" 
              type="date"
              style={{ flex: '0 1 150px' }}
              value={projDeadline}
              onChange={(e) => setProjDeadline(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              className="input-field" 
              style={{ flex: '1' }}
              placeholder="Description / Notes"
              value={projDescription}
              onChange={(e) => setProjDescription(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Plus size={18} /> Add Project
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddData;
