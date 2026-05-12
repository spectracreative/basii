import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TodoList from './components/TodoList';
import Projects from './components/Projects';
import Analytics from './components/Analytics';
import Login from './components/Login';
import DeadlineAlerts from './components/DeadlineAlerts';
import Earnings from './components/Earnings';
import AddData from './components/AddData';
import BottomNav from './components/BottomNav';
import { supabase } from './utils/supabase';

const App = () => {
  const [session, setSession] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('All Time');
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'earnings'
  
  // Data State
  const [transactions, setTransactions] = useState([]);
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [txnRes, todosRes, projRes, clientsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }),
        supabase.from('todos').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*')
      ]);

      if (txnRes.data) setTransactions(txnRes.data);
      if (todosRes.data) setTodos(todosRes.data);
      if (projRes.data) setProjects(projRes.data);
      if (clientsRes.data) setClients(clientsRes.data.map(c => c.name));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAddTransaction = async (project) => {
    if (!project || !project.amount || project.amount <= 0) return;
    
    const newTxn = {
      user_id: session.user.id,
      desc: `Payment: ${project.name} (${project.client})`,
      amount: parseFloat(project.amount),
      type: 'credit',
      date: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.from('transactions').insert([newTxn]).select();
      if (error) throw error;
      if (data && data[0]) {
        setTransactions(prev => [data[0], ...prev]);
      }
    } catch (error) {
      console.error('Error auto-adding transaction:', error);
    }
  };

  const availableMonths = React.useMemo(() => {
    const months = new Set();
    const addMonth = (dateString) => {
      if (!dateString) return;
      const date = new Date(dateString);
      if (!isNaN(date)) {
        months.add(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
      }
    };
    
    transactions.forEach(t => addMonth(t.created_at));
    projects.forEach(p => addMonth(p.created_at || new Date(parseInt(p.id))));
    
    return ['All Time', ...Array.from(months)];
  }, [transactions, projects]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Login onLogin={setSession} />;
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--color-primary)' }}>Loading your dashboard...</div>;
  }

  return (
    <div className="container">
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>Basii Dashboard</h1>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Personal Finance & Task Manager</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            className="input-field" 
            style={{ width: 'auto', minWidth: '150px', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main style={{ position: 'relative' }}>
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Deadline Alerts (Global, not filtered by month) */}
              <DeadlineAlerts projects={projects} />

              {/* Analytics Section */}
              <Analytics transactions={transactions} projects={projects} clients={clients} selectedMonth={selectedMonth} />

              <Dashboard transactions={transactions} selectedMonth={selectedMonth} />
              
              {/* Finance and Tasks */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                  <Transactions transactions={transactions} setTransactions={setTransactions} session={session} selectedMonth={selectedMonth} />
                </div>
                <div style={{ flex: 1 }}>
                  <TodoList todos={todos} setTodos={setTodos} session={session} />
                </div>
              </div>
            </motion.div>
          ) : currentPage === 'projects' ? (
            <motion.div 
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Projects 
                projects={projects} 
                setProjects={setProjects} 
                clients={clients} 
                setClients={setClients} 
                session={session} 
                selectedMonth={selectedMonth} 
                onPaymentReceived={handleAutoAddTransaction}
              />
            </motion.div>
          ) : currentPage === 'add' ? (
            <motion.div 
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AddData 
                session={session} 
                transactions={transactions} 
                setTransactions={setTransactions} 
                projects={projects} 
                setProjects={setProjects} 
                clients={clients} 
                setClients={setClients} 
              />
            </motion.div>
          ) : (
            <motion.div 
              key="earnings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Earnings transactions={transactions} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default App;
