import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TodoList from './components/TodoList';
import Projects from './components/Projects';
import Analytics from './components/Analytics';
import Login from './components/Login';
import { supabase } from './utils/supabase';

const App = () => {
  const [session, setSession] = useState(null);
  
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main>
        {/* Analytics Section */}
        <Analytics transactions={transactions} projects={projects} clients={clients} />

        <Dashboard transactions={transactions} />
        
        {/* Finance and Tasks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <Transactions transactions={transactions} setTransactions={setTransactions} session={session} />
          </div>
          <div style={{ flex: 1 }}>
            <TodoList todos={todos} setTodos={setTodos} session={session} />
          </div>
        </div>

        {/* Graphic Design Projects */}
        <Projects projects={projects} setProjects={setProjects} clients={clients} setClients={setClients} session={session} />
      </main>
    </div>
  );
};

export default App;
