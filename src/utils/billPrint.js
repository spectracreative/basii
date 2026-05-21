import jsPDF from 'jspdf';

/**
 * Generates and downloads a professional PDF invoice for a project.
 * Uses jsPDF for direct PDF creation — no print dialog needed.
 */
export const printProjectBill = (project) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
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
    totalBg: [232, 245, 241],    // #E8F5F1 (teal tinted)
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

  const billDate = project.paymentCompletedDate
    ? new Date(project.paymentCompletedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  const invoiceNo = `INV-${project.id?.toString().slice(-6).toUpperCase() || Date.now()}`;

  let y = margin;

  // ================================================================
  // HEADER — Full-width gradient banner with white text
  // ================================================================
  const headerHeight = 38;

  // Draw gradient background
  drawGradientRect(0, 0, pageWidth, headerHeight, colors.brand, colors.brandLighter);

  // Brand name — white on gradient
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...colors.white);
  doc.text('Basii Studio', margin, 16);

  // Brand tagline — white (slightly transparent feel via lighter weight)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Graphic Design Services', margin, 23);

  // INVOICE title — right side, white
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(30);
  doc.setTextColor(...colors.white);
  doc.text('INVOICE', pageWidth - margin, 15, { align: 'right' });

  // Invoice number — white
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(230, 255, 248);
  doc.text(invoiceNo, pageWidth - margin, 23, { align: 'right' });

  // Date — white
  doc.setFontSize(10);
  doc.text(billDate, pageWidth - margin, 30, { align: 'right' });

  // Thin accent line below header
  doc.setDrawColor(...colors.brandLight);
  doc.setLineWidth(0.6);
  doc.line(0, headerHeight, pageWidth, headerHeight);

  y = headerHeight + 12;

  // ================================================================
  // CLIENT & PROJECT DETAILS (Two-column layout)
  // ================================================================
  const colWidth = contentWidth / 2;

  // Left column — Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  doc.text('BILLED TO', margin, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.textDark);
  doc.text(project.client || 'Client', margin, y + 7);

  // Right column — Project
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...colors.textLight);
  doc.text('PROJECT', margin + colWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.textDark);
  doc.text(project.name || 'Project', margin + colWidth, y + 7);

  if (project.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...colors.textMuted);
    const descLines = doc.splitTextToSize(project.description, colWidth - 10);
    doc.text(descLines, margin + colWidth, y + 13);
  }

  y += 24;

  // Second row of details: Deadline + Delivery Date
  const detailItems = [];
  if (project.deadline) {
    detailItems.push({ label: 'DEADLINE', value: project.deadline });
  }
  if (project.deliveryDate) {
    detailItems.push({ label: 'DELIVERED ON', value: project.deliveryDate });
  }

  if (detailItems.length > 0) {
    detailItems.forEach((item, i) => {
      const xPos = margin + i * colWidth;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.textLight);
      doc.text(item.label, xPos, y);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(...colors.textDark);
      doc.text(item.value, xPos, y + 6);
    });
    y += 16;
  }

  y += 6;

  // ================================================================
  // TABLE — Line items
  // ================================================================
  const tableStartY = y;
  const colDefs = [
    { label: '#', width: 12, align: 'center' },
    { label: 'Description', width: contentWidth - 12 - 30 - 35, align: 'left' },
    { label: 'Status', width: 35, align: 'center' },
    { label: 'Amount', width: 30, align: 'right' },
  ];

  // Table header
  doc.setFillColor(...colors.brand);
  doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.white);

  let colX = margin;
  colDefs.forEach(col => {
    const textX = col.align === 'center' ? colX + col.width / 2
      : col.align === 'right' ? colX + col.width - 3
      : colX + 4;
    doc.text(col.label, textX, y + 7, { align: col.align === 'left' ? 'left' : col.align });
    colX += col.width;
  });

  y += 14;

  // Table row — project line item
  const rowHeight = 16;

  // Light background for the row
  doc.setFillColor(...colors.tableStripe);
  doc.roundedRect(margin, y - 3, contentWidth, rowHeight, 1, 1, 'F');

  colX = margin;

  // Column: #
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textDark);
  doc.text('1', colX + colDefs[0].width / 2, y + 5, { align: 'center' });
  colX += colDefs[0].width;

  // Column: Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textDark);
  const descText = project.name || 'Design Service';
  doc.text(descText, colX + 4, y + 5);

  if (project.description) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textMuted);
    const shortDesc = project.description.length > 60
      ? project.description.substring(0, 57) + '...'
      : project.description;
    doc.text(shortDesc, colX + 4, y + 10);
  }
  colX += colDefs[1].width;

  // Column: Status badge
  const isPaid = !project.paymentPending;
  const badgeText = isPaid ? 'PAID' : 'PENDING';
  const badgeBg = isPaid ? colors.successBg : colors.warningBg;
  const badgeColor = isPaid ? colors.successText : colors.warningText;

  doc.setFillColor(...badgeBg);
  const badgeWidth = 22;
  const badgeX = colX + (colDefs[2].width - badgeWidth) / 2;
  doc.roundedRect(badgeX, y + 1, badgeWidth, 7, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...badgeColor);
  doc.text(badgeText, colX + colDefs[2].width / 2, y + 6, { align: 'center' });
  colX += colDefs[2].width;

  // Column: Amount
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...colors.textDark);
  const amountStr = `Rs.${(project.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  doc.text(amountStr, colX + colDefs[3].width - 3, y + 5, { align: 'right' });

  y += rowHeight + 2;

  // Bottom border
  doc.setDrawColor(...colors.tableBorder);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  y += 4;

  // ================================================================
  // TOTAL ROW
  // ================================================================
  doc.setFillColor(...colors.totalBg);
  doc.roundedRect(margin, y - 2, contentWidth, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...colors.textDark);
  doc.text('Total', pageWidth - margin - colDefs[3].width - 8, y + 7, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...colors.brand);
  const totalStr = `Rs.${(project.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  doc.text(totalStr, pageWidth - margin - 3, y + 7, { align: 'right' });

  y += 22;

  // ================================================================
  // PAYMENT INFO BOX (if paid)
  // ================================================================
  if (!project.paymentPending && project.paymentCompletedDate) {
    const paymentDate = new Date(project.paymentCompletedDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    doc.setFillColor(...colors.successBg);
    doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'F');

    doc.setDrawColor(...colors.success);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 16, 3, 3, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...colors.successText);
    doc.text('PAYMENT RECEIVED', margin + 8, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Payment was received on ${paymentDate}`, margin + 8, y + 12);

    y += 24;
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
  // FOOTER — Gradient bar with white text
  // ================================================================
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = 18;
  const footerTop = pageHeight - footerHeight;

  // Draw gradient footer (reversed direction for visual variety)
  drawGradientRect(0, footerTop, pageWidth, footerHeight, colors.brandLighter, colors.brand);

  // Footer text — white
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...colors.white);
  doc.text(
    'Basii Studio',
    pageWidth / 2,
    footerTop + 8,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(230, 255, 248);
  doc.text(
    'Graphic Design Services  ·  Thank you for your business!',
    pageWidth / 2,
    footerTop + 13,
    { align: 'center' }
  );

  // ================================================================
  // AUTO-DOWNLOAD PDF
  // ================================================================
  const fileName = `Invoice_${(project.name || 'Project').replace(/[^a-zA-Z0-9]/g, '_')}_${invoiceNo}.pdf`;
  doc.save(fileName);
};
