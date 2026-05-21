import jsPDF from 'jspdf';

/**
 * Generates and downloads a professional combined PDF invoice for multiple projects.
 * Accepts a single project or an array of projects.
 */
export const printProjectBill = (projectsInput) => {
  const projects = Array.isArray(projectsInput) ? projectsInput : [projectsInput];
  if (projects.length === 0) return;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // --- Color Palette ---
  const colors = {
    brand: [16, 68, 62],         // #10443E
    brandLight: [26, 107, 90],   // #1A6B5A
    brandLighter: [34, 139, 117],// #228B75
    textDark: [26, 26, 46],      // #1A1A2E
    textMuted: [107, 114, 128],  // #6B7280
    textLight: [156, 163, 175],  // #9CA3AF
    success: [16, 185, 129],     // #10B981
    successBg: [209, 250, 229],  // #D1FAE5
    successText: [6, 95, 70],    // #065F46
    warning: [245, 158, 11],     // #F59E0B
    warningBg: [254, 243, 199],  // #FEF3C7
    warningText: [146, 64, 14],  // #92400E
    white: [255, 255, 255],
    tableBorder: [229, 231, 235],// #E5E7EB
    tableStripe: [249, 250, 251],// #F9FAFB
    totalBg: [232, 245, 241],    // #E8F5F1
  };

  // Helper: draw a horizontal gradient rectangle
  const drawGradientRect = (xStart, yStart, width, height, colorFrom, colorTo, steps = 60) => {
    const sliceWidth = width / steps;
    for (let i = 0; i < steps; i++) {
      const ratio = i / (steps - 1);
      const r = Math.round(colorFrom[0] + (colorTo[0] - colorFrom[0]) * ratio);
      const g = Math.round(colorFrom[1] + (colorTo[1] - colorFrom[1]) * ratio);
      const b = Math.round(colorFrom[2] + (colorTo[2] - colorFrom[2]) * ratio);
      doc.setFillColor(r, g, b);
      doc.rect(xStart + i * sliceWidth, yStart, sliceWidth + 0.5, height, 'F');
    }
  };

  // Helper: draw footer on current page
  const drawFooter = () => {
    const footerHeight = 18;
    const footerTop = pageHeight - footerHeight;
    drawGradientRect(0, footerTop, pageWidth, footerHeight, colors.brandLighter, colors.brand);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.white);
    doc.text('Basii Studio', pageWidth / 2, footerTop + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(230, 255, 248);
    doc.text('Graphic Design Services  ·  Thank you for your business!', pageWidth / 2, footerTop + 13, { align: 'center' });
  };

  // Collect info
  const billDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;
  const grandTotal = projects.reduce((sum, p) => sum + (p.amount || 0), 0);
  const unpaidTotal = projects.filter(p => p.paymentPending).reduce((sum, p) => sum + (p.amount || 0), 0);

  // Get unique clients
  const clientNames = [...new Set(projects.map(p => p.client).filter(Boolean))];
  const clientDisplay = clientNames.length > 0 ? clientNames.join(', ') : 'Client';

  let y = margin;

  // ================================================================
  // HEADER — Full-width gradient banner with white text
  // ================================================================
  const headerHeight = 38;
  drawGradientRect(0, 0, pageWidth, headerHeight, colors.brand, colors.brandLighter);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...colors.white);
  doc.text('Basii Studio', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Graphic Design Services', margin, 23);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...colors.white);
  doc.text('INVOICE', pageWidth - margin, 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 255, 248);
  doc.text(invoiceNo, pageWidth - margin, 23, { align: 'right' });
  doc.text(billDate, pageWidth - margin, 30, { align: 'right' });

  doc.setDrawColor(...colors.brandLight);
  doc.setLineWidth(0.6);
  doc.line(0, headerHeight, pageWidth, headerHeight);

  y = headerHeight + 12;

  // ================================================================
  // CLIENT & INVOICE SUMMARY
  // ================================================================
  const colWidth = contentWidth / 2;

  // Left — Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  doc.text('BILLED TO', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.textDark);
  const clientText = clientDisplay.length > 30 ? clientDisplay.substring(0, 28) + '...' : clientDisplay;
  doc.text(clientText, margin, y + 7);

  // Right — Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  doc.text('INVOICE SUMMARY', margin + colWidth, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textDark);
  doc.text(`${projects.length} project${projects.length > 1 ? 's' : ''}`, margin + colWidth, y + 7);

  if (unpaidTotal > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.warningText);
    doc.text(`Amount Due: Rs.${unpaidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + colWidth, y + 14);
  }

  y += 28;

  // ================================================================
  // TABLE — All project line items
  // ================================================================
  const colDefs = [
    { label: '#', width: 10, align: 'center' },
    { label: 'Project', width: contentWidth - 10 - 35 - 28 - 30, align: 'left' },
    { label: 'Client', width: 35, align: 'left' },
    { label: 'Status', width: 28, align: 'center' },
    { label: 'Amount', width: 30, align: 'right' },
  ];

  // Table header
  doc.setFillColor(...colors.brand);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.white);

  let colX = margin;
  colDefs.forEach(col => {
    const textX = col.align === 'center' ? colX + col.width / 2
      : col.align === 'right' ? colX + col.width - 3
      : colX + 3;
    doc.text(col.label, textX, y + 7, { align: col.align === 'left' ? 'left' : col.align });
    colX += col.width;
  });

  y += 13;

  // Footer area reserved
  const footerReserve = 70; // space for total + notes + footer bar
  const maxContentY = pageHeight - footerReserve;

  // Table rows
  projects.forEach((project, index) => {
    const rowHeight = 14;

    // Check if we need a new page
    if (y + rowHeight > maxContentY) {
      drawFooter();
      doc.addPage();
      y = margin;

      // Re-draw table header on new page
      doc.setFillColor(...colors.brand);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.white);
      let hColX = margin;
      colDefs.forEach(col => {
        const textX = col.align === 'center' ? hColX + col.width / 2
          : col.align === 'right' ? hColX + col.width - 3
          : hColX + 3;
        doc.text(col.label, textX, y + 7, { align: col.align === 'left' ? 'left' : col.align });
        hColX += col.width;
      });
      y += 13;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(...colors.tableStripe);
      doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
    }

    colX = margin;

    // #
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);
    doc.text(`${index + 1}`, colX + colDefs[0].width / 2, y + 5, { align: 'center' });
    colX += colDefs[0].width;

    // Project name + description
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textDark);
    const projName = (project.name || 'Project').length > 28
      ? (project.name || 'Project').substring(0, 26) + '...'
      : (project.name || 'Project');
    doc.text(projName, colX + 3, y + 4);

    if (project.description) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...colors.textMuted);
      const shortDesc = project.description.length > 35
        ? project.description.substring(0, 33) + '...'
        : project.description;
      doc.text(shortDesc, colX + 3, y + 9);
    }
    colX += colDefs[1].width;

    // Client
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    const clientName = (project.client || '-').length > 14
      ? (project.client || '-').substring(0, 12) + '...'
      : (project.client || '-');
    doc.text(clientName, colX + 3, y + 5);
    colX += colDefs[2].width;

    // Status badge
    const isPaid = !project.paymentPending;
    const badgeText = isPaid ? 'PAID' : 'UNPAID';
    const badgeBg = isPaid ? colors.successBg : colors.warningBg;
    const badgeColor = isPaid ? colors.successText : colors.warningText;

    doc.setFillColor(...badgeBg);
    const badgeW = 18;
    const badgeX = colX + (colDefs[3].width - badgeW) / 2;
    doc.roundedRect(badgeX, y + 1, badgeW, 6, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(...badgeColor);
    doc.text(badgeText, colX + colDefs[3].width / 2, y + 5.5, { align: 'center' });
    colX += colDefs[3].width;

    // Amount
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textDark);
    const amt = `Rs.${(project.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    doc.text(amt, colX + colDefs[4].width - 3, y + 5, { align: 'right' });

    // Row bottom border
    doc.setDrawColor(...colors.tableBorder);
    doc.setLineWidth(0.2);
    doc.line(margin, y + rowHeight - 2, pageWidth - margin, y + rowHeight - 2);

    y += rowHeight;
  });

  y += 4;

  // ================================================================
  // TOTAL ROW
  // ================================================================
  doc.setFillColor(...colors.totalBg);
  doc.roundedRect(margin, y - 2, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textDark);
  doc.text('Grand Total', pageWidth - margin - colDefs[4].width - 8, y + 7, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.brand);
  const totalStr = `Rs.${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  doc.text(totalStr, pageWidth - margin - 3, y + 7, { align: 'right' });

  y += 20;

  // Unpaid subtotal if there's a mix
  const paidTotal = grandTotal - unpaidTotal;
  if (unpaidTotal > 0 && paidTotal > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);
    doc.text(`Paid: Rs.${paidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 3, y, { align: 'right' });
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...colors.warningText);
    doc.text(`Amount Due: Rs.${unpaidTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - margin - 3, y, { align: 'right' });
    y += 10;
  }

  // ================================================================
  // NOTES / TERMS
  // ================================================================
  y += 4;
  doc.setDrawColor(...colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.textMuted);
  doc.text('NOTES & TERMS', margin, y);

  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  const terms = [
    'Thank you for choosing Basii Studio for your design needs.',
    'Payment is due upon receipt unless otherwise agreed.',
    'All designs remain property of Basii Studio until full payment is received.',
  ];
  terms.forEach(term => {
    doc.text(`•  ${term}`, margin, y);
    y += 5;
  });

  // ================================================================
  // FOOTER
  // ================================================================
  drawFooter();

  // ================================================================
  // AUTO-DOWNLOAD PDF
  // ================================================================
  const fileName = projects.length === 1
    ? `Invoice_${(projects[0].name || 'Project').replace(/[^a-zA-Z0-9]/g, '_')}_${invoiceNo}.pdf`
    : `Invoice_${projects.length}_Projects_${invoiceNo}.pdf`;
  doc.save(fileName);
};
