import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, FileText } from 'lucide-react';

const InvoiceGenerator = ({ projects, projectsToLoad, clearProjectsToLoad }) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billedTo: {
      name: '',
      address: '',
      email: ''
    },
    from: {
      name: 'Basii accounts',
      address: 'Creative Studio\nKerala, India',
      email: 'hello@spectracreative.com'
    },
    notes: 'Thank you for your business!'
  });

  const [items, setItems] = useState([
    { id: 1, description: 'Design Services', quantity: 1, rate: 0 }
  ]);

  useEffect(() => {
    if (projectsToLoad && projectsToLoad.length > 0) {
      // Map loaded projects to invoice items
      const newItems = projectsToLoad.map((p, index) => ({
        id: Date.now() + index,
        description: p.name || 'Project Name',
        quantity: 1,
        rate: parseFloat(p.amount) || 0
      }));
      setItems(newItems);

      // Extract client details if available (use the first project's client)
      const firstClient = projectsToLoad.find(p => p.client)?.client;
      if (firstClient) {
        setInvoiceData(prev => ({
          ...prev,
          billedTo: { ...prev.billedTo, name: firstClient }
        }));
      }

      // Clear the prop so it doesn't reload indefinitely
      if (clearProjectsToLoad) {
        clearProjectsToLoad();
      }
    }
  }, [projectsToLoad, clearProjectsToLoad]);

  const handleDataChange = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleBilledToChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      billedTo: { ...prev.billedTo, [field]: value }
    }));
  };

  const handleFromChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      from: { ...prev.from, [field]: value }
    }));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const total = calculateSubtotal();

  return (
    <div className="invoice-container" style={{ marginTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* HEADER CONTROLS (Hidden on Print) */}
      <div className="flex-between no-print" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-lg)' }}>
            <FileText size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-main)' }}>Invoice Generator</h2>
            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Create and print professional invoices</p>
          </div>
        </div>
        <button onClick={handlePrint} className="btn btn-primary">
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      <div className="invoice-layout">
        
        {/* EDITOR PANEL (Hidden on Print) */}
        <div className="card glass no-print editor-panel">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>Invoice Details</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Invoice Number</label>
              <input type="text" className="input-field" value={invoiceData.invoiceNumber} onChange={(e) => handleDataChange('invoiceNumber', e.target.value)} />
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Date</label>
              <input type="date" className="input-field" value={invoiceData.date} onChange={(e) => handleDataChange('date', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Your Details (From)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" className="input-field" placeholder="Your Business Name" value={invoiceData.from.name} onChange={(e) => handleFromChange('name', e.target.value)} />
              <input type="text" className="input-field" placeholder="Subtitle or Email" value={invoiceData.from.email} onChange={(e) => handleFromChange('email', e.target.value)} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>Billed To</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="text" className="input-field" placeholder="Client Name" value={invoiceData.billedTo.name} onChange={(e) => handleBilledToChange('name', e.target.value)} />
              <input type="email" className="input-field" placeholder="Email Address" value={invoiceData.billedTo.email} onChange={(e) => handleBilledToChange('email', e.target.value)} />
              <textarea className="input-field" placeholder="Billing Address" rows="2" value={invoiceData.billedTo.address} onChange={(e) => handleBilledToChange('address', e.target.value)}></textarea>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Line Items</h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, index) => (
                <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <input 
                    list={`project-list-${item.id}`}
                    type="text" 
                    className="input-field" 
                    placeholder="Description (Select project or type...)" 
                    style={{ flex: 2 }} 
                    value={item.description} 
                    onChange={(e) => {
                      const val = e.target.value;
                      handleItemChange(item.id, 'description', val);
                      
                      // Auto-fill rate if a project matches the description
                      if (projects && projects.length > 0) {
                        const matchedProject = projects.find(p => p.name === val);
                        if (matchedProject && matchedProject.amount) {
                          handleItemChange(item.id, 'rate', parseFloat(matchedProject.amount));
                        }
                      }
                    }} 
                  />
                  <datalist id={`project-list-${item.id}`}>
                    {projects?.map(p => (
                      <option key={p.id} value={p.name}>{p.client ? `${p.name} - ${p.client}` : p.name}</option>
                    ))}
                  </datalist>
                  <input type="number" className="input-field" placeholder="Qty" style={{ width: '60px' }} value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} />
                  <input type="number" className="input-field" placeholder="Rate" style={{ width: '80px' }} value={item.rate} onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)} />
                  <button onClick={() => removeItem(item.id)} className="btn-icon" style={{ padding: '0.6rem', color: 'var(--color-danger)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="btn btn-outline" style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.25rem' }}>Notes</label>
            <textarea className="input-field" rows="2" value={invoiceData.notes} onChange={(e) => handleDataChange('notes', e.target.value)}></textarea>
          </div>
        </div>

        {/* PRINT PREVIEW PANEL */}
        <div className="invoice-preview card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '29.7cm' }}>
          
          {/* HEADER BANNER */}
          <div style={{ background: 'linear-gradient(90deg, #10443E, #228B75)', color: 'white', padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0 }}>{invoiceData.from.name || 'Your Name'}</h1>
              <p style={{ color: '#E6FFF8', fontSize: '0.9rem', marginTop: '0.25rem' }}>{invoiceData.from.email || 'Services'}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '0.05em', margin: 0 }}>INVOICE</h1>
              <p style={{ color: '#E6FFF8', fontSize: '0.9rem', marginTop: '0.25rem' }}>{invoiceData.invoiceNumber} | {invoiceData.date}</p>
            </div>
          </div>

          <div style={{ padding: '3rem', flex: 1 }}>
            {/* CLIENT & SUMMARY AREA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
              <div>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>BILLED TO</h4>
                {invoiceData.billedTo.name ? (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-text-main)', margin: '0 0 0.25rem 0' }}>{invoiceData.billedTo.name}</h3>
                    {invoiceData.billedTo.address && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap', margin: '0 0 0.25rem 0' }}>{invoiceData.billedTo.address}</p>}
                    {invoiceData.billedTo.email && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 0 }}>{invoiceData.billedTo.email}</p>}
                  </>
                ) : (
                  <p style={{ color: 'var(--color-text-light)', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>Client details...</p>
                )}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>INVOICE SUMMARY</h4>
                <p style={{ color: 'var(--color-text-main)', fontSize: '1rem', margin: '0 0 0.25rem 0' }}>{items.length} Project{items.length !== 1 ? 's' : ''}</p>
                <p style={{ color: '#F59E0B', fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Amount Due: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* TABLE */}
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, marginBottom: '3rem' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: '#10443E', color: 'white', padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', width: '5%', borderTopLeftRadius: 'var(--radius-md)', borderBottomLeftRadius: 'var(--radius-md)' }}>#</th>
                  <th style={{ backgroundColor: '#10443E', color: 'white', padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem' }}>Project / Description</th>
                  <th style={{ backgroundColor: '#10443E', color: 'white', padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.8rem', width: '15%' }}>Qty</th>
                  <th style={{ backgroundColor: '#10443E', color: 'white', padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', width: '20%' }}>Rate</th>
                  <th style={{ backgroundColor: '#10443E', color: 'white', padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', width: '20%', borderTopRightRadius: 'var(--radius-md)', borderBottomRightRadius: 'var(--radius-md)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} style={{ backgroundColor: index % 2 === 0 ? '#F9FAFB' : 'transparent' }}>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', borderBottom: '1px solid #E5E7EB' }}>{index + 1}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--color-text-main)', borderBottom: '1px solid #E5E7EB' }}>{item.description || 'Item description'}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-main)', borderBottom: '1px solid #E5E7EB' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-main)', borderBottom: '1px solid #E5E7EB' }}>₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-main)', borderBottom: '1px solid #E5E7EB' }}>₹{(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TOTAL ROW */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
              <div style={{ backgroundColor: '#E8F5F1', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '2rem', minWidth: '250px', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>Grand Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10443E' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* NOTES & TERMS */}
            <div>
              <div style={{ borderTop: '2px solid #E5E7EB', paddingTop: '1.5rem' }}>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>NOTES & TERMS</h4>
                {invoiceData.notes ? (
                  <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0 }}>{invoiceData.notes}</p>
                ) : (
                  <ul style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', margin: 0, paddingLeft: '1rem' }}>
                    <li style={{ marginBottom: '0.25rem' }}>Thank you for choosing Basii Studio for your design needs.</li>
                    <li style={{ marginBottom: '0.25rem' }}>Payment is due upon receipt unless otherwise agreed.</li>
                    <li>All designs remain property of Basii Studio until full payment is received.</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ background: 'linear-gradient(90deg, #228B75, #10443E)', color: 'white', padding: '1rem', textAlign: 'center', marginTop: 'auto' }}>
            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', fontSize: '0.9rem' }}>{invoiceData.from.name || 'Your Name'}</p>
            <p style={{ margin: 0, color: '#E6FFF8', fontSize: '0.75rem' }}>{invoiceData.from.email ? `${invoiceData.from.email} · ` : ''}Thank you for your business!</p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
