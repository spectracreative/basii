import React from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import TodoList from './components/TodoList';
import Projects from './components/Projects';
import Analytics from './components/Analytics';
import Login from './components/Login';
import { LayoutDashboard, LogOut } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('basii_auth', false);
  const [transactions, setTransactions] = useLocalStorage('basii_transactions', []);
  const [todos, setTodos] = useLocalStorage('basii_todos', []);
  const [projects, setProjects] = useLocalStorage('basii_projects', []);
  const [clients, setClients] = useLocalStorage('basii_clients', ['Fitcore', 'Tornadoes', 'LG']);

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleGlobalReset = () => {
    const pwd = window.prompt("WARNING: This will delete ALL data. Enter password to confirm:");
    if (pwd === 'Basi@2384') {
      window.localStorage.clear();
      window.location.reload();
    } else if (pwd !== null) {
      alert("Incorrect password.");
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="container">
      {/* Header */}
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            backgroundColor: 'var(--color-primary)', 
            padding: '0.75rem', 
            borderRadius: 'var(--radius-md)',
            color: 'white'
          }}>
            <LayoutDashboard size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>
              Basii
            </h1>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Professional Dashboard</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleGlobalReset} className="btn btn-outline" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
            Reset All Data
          </button>
          <button onClick={handleLogout} className="btn btn-outline">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Analytics & Graphs */}
        <Analytics projects={projects} transactions={transactions} />

        {/* Existing Overview */}
        <Dashboard transactions={transactions} />
        
        {/* Projects Tracker */}
        <Projects 
          projects={projects} 
          setProjects={setProjects} 
          clients={clients} 
          setClients={setClients} 
        />

        {/* Finance and Tasks */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <Transactions transactions={transactions} setTransactions={setTransactions} />
          </div>
          <div style={{ flex: 1 }}>
            <TodoList todos={todos} setTodos={setTodos} />
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
