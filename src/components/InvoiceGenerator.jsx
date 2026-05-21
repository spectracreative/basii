import React, { useState } from 'react';
import { Plus, Trash2, Printer, FileText } from 'lucide-react';

const InvoiceGenerator = ({ projects }) => {
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

  const handleDataChange = (field, value) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const handleBilledToChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      billedTo: { ...prev.billedTo, [field]: value }
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

        {/* PRINT PREVIEW PANEL (Visible always, forms the actual invoice on print) */}
        <div className="invoice-preview card">
          
          <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>INVOICE</h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>#{invoiceData.invoiceNumber}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-text-main)' }}>{invoiceData.from.name}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{invoiceData.from.address}</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{invoiceData.from.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
            <div>
              <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Billed To</h4>
              {invoiceData.billedTo.name ? (
                <>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--color-text-main)' }}>{invoiceData.billedTo.name}</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{invoiceData.billedTo.address}</p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{invoiceData.billedTo.email}</p>
                </>
              ) : (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Client details...</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Date</h4>
                <p style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>{invoiceData.date}</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Due Date</h4>
                <p style={{ fontWeight: '500', color: 'var(--color-text-main)' }}>{invoiceData.dueDate}</p>
              </div>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Rate</th>
                <th style={{ textAlign: 'right', padding: '1rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: '500', color: 'var(--color-text-main)' }}>{item.description || 'Item description'}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--color-text-main)' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', color: 'var(--color-text-main)' }}>₹{item.rate.toFixed(2)}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '600', color: 'var(--color-text-main)' }}>₹{(item.quantity * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
            <div style={{ width: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: '500' }}>₹{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Total Due</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-primary)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoiceData.notes && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
              <h4 style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Notes</h4>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{invoiceData.notes}</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
