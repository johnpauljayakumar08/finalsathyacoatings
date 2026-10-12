// DispatchReportConsumable.jsx
import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

const DispatchReportConsumable = ({
  batch,                // single batch object from groupedDispatches
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Generate a pseudo DC number if not available
  const dcNo = `DC-${batch.currentSite?.slice(0,3).toUpperCase() || 'CON'}-${formatDate(batch.dispatchDate).replace(/ /g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

  // Split items into pages (e.g. 12 items per page)
  const itemsPerPage = 12;
  const itemChunks = [];
  for (let i = 0; i < batch.items.length; i += itemsPerPage) {
    itemChunks.push(batch.items.slice(i, i + itemsPerPage));
  }
  if (itemChunks.length === 0) itemChunks.push([]);

  const handleDownloadPDF = () => {
    const element = document.getElementById('consumable-report-content');
    if (!element) return;

    const opt = {
      margin: [10, 10, 15, 10], // top, right, bottom, left (mm)
      filename: `consumable_dispatch_${dcNo}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="report-controls no-print">
          <button onClick={handleDownloadPDF} className="download-btn">
            Download PDF
          </button>
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>

        <div id="consumable-report-content" className="report-wrapper">
          <div className="pages-container">
            {itemChunks.map((chunk, pageIdx) => (
              <div key={pageIdx} className="a4-page">
                {/* Header - appears on every page */}
                <div className="report-header">
                  <div className="logo-company">
                    <img src="/logo_abstract.png" alt="Company Logo" className="company-logo" />
                    <div className="company-info">
                      <h2>SATHYA HITEC SOLUTIONS LLP</h2>
                      <p>222, Chinnammal Nagar, Edayarpalayam, Vadavalli Road, Coimbatore - 641041</p>
                      <p>Ph: 0422 2401231 | 9600555870 | Email: sathyaec@gmail.com</p>
                      <p>GSTIN: 33ACJFS1582J1ZW</p>
                    </div>
                  </div>

                  <h1 className="document-title">CONSUMABLE DISPATCH CHALLAN</h1>

                  <div className="dispatch-info-grid">
                    <div className="info-block from">
                      <h3>From (Current Site)</h3>
                      <p><strong>{batch.currentSite || '—'}</strong></p>
                      {batch.fromAddress && <p>{batch.fromAddress}</p>}
                      {batch.currentInchargeName && (
                        <p>
                          Incharge: {batch.currentInchargeName}
                          {batch.currentInchargeMobile && ` | Ph: ${batch.currentInchargeMobile}`}
                        </p>
                      )}
                    </div>

                    <div className="info-block to">
                      <h3>To (Destination)</h3>
                      <p><strong>{batch.destinationSite || '—'}</strong></p>
                      {batch.toAddress && <p>{batch.toAddress}</p>}
                      {batch.destinationInchargeName && (
                        <p>
                          Incharge: {batch.destinationInchargeName}
                          {batch.destinationInchargeMobile && ` | Ph: ${batch.destinationInchargeMobile}`}
                        </p>
                      )}
                    </div>

                    <div className="info-block meta">
                      <p><strong>DC No:</strong> {dcNo}</p>
                      <p><strong>Dispatch Date:</strong> {formatDate(batch.dispatchDate)}</p>
                      {batch.vehicleName && (
                        <p>
                          <strong>Vehicle:</strong> {batch.vehicleName} {batch.vehicleNumber ? `(${batch.vehicleNumber})` : ''}
                        </p>
                      )}
                      {batch.driverName && (
                        <p>
                          <strong>Driver:</strong> {batch.driverName} {batch.driverMobile ? `(${batch.driverMobile})` : ''}
                        </p>
                      )}
                      {batch.transportAmount > 0 && (
                        <p><strong>Transport Amount:</strong> ₹{Number(batch.transportAmount).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table - Fixed width to prevent cutoff */}
                <div className="table-container">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th width="8%">Sl.No</th>
                        <th width="62%">Consumable Item</th>
                        <th width="15%">Quantity</th>
                        <th width="15%">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chunk.length > 0 ? (
                        chunk.map((item, idx) => {
                          const slNo = pageIdx * itemsPerPage + idx + 1;
                          return (
                            <tr key={idx}>
                              <td className="text-center">{slNo}</td>
                              <td>{item.consumableName || '—'}</td>
                              <td className="text-center quantity-cell">{item.quantity || '—'}</td>
                              <td className="text-center">—</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="no-data">No items to display</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer - only on last page */}
                {pageIdx === itemChunks.length - 1 && (
                  <div className="report-footer">
                    <div className="signature-section">
                      <p>Received the above materials in good condition</p>
                      <div className="signature-line">
                        <p>Receiver's Signature & Stamp</p>
                      </div>
                    </div>

                    <div className="authorized-section">
                      <p>For SATHYA HITEC SOLUTIONS LLP</p>
                      <div className="signature-line">
                        <p>Authorised Signatory</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 100%;
          max-width: 1100px;
          max-height: 95vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .report-controls.no-print {
          padding: 16px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }

        .download-btn, .close-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
        }

        .download-btn {
          background: #2563eb;
          color: white;
        }

        .download-btn:hover {
          background: #1d4ed8;
        }

        .close-btn {
          background: #f1f5f9;
          color: #374151;
        }

        .close-btn:hover {
          background: #e2e8f0;
        }

        .report-wrapper {
          padding: 20px;
          background: #f8fafc;
          overflow-x: auto;
        }

        .pages-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          position: relative;
          padding: 10mm;
          box-sizing: border-box;
        }

        .report-header {
          margin-bottom: 6mm;
        }

        .logo-company {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .company-logo {
          height: 50px;
          margin-right: 16px;
        }

        .company-info h2 {
          margin: 0;
          font-size: 20px;
          color: #1e40af;
        }

        .company-info p {
          margin: 4px 0;
          font-size: 11px;
          color: #374151;
        }

        .document-title {
          text-align: center;
          font-size: 22px;
          font-weight: bold;
          margin: 12px 0 20px;
          color: #111827;
          letter-spacing: 1px;
        }

        .dispatch-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          font-size: 12px;
          margin-bottom: 6mm;
        }

        .info-block h3 {
          font-size: 13px;
          margin: 0 0 6px 0;
          color: #1f2937;
          border-bottom: 1px solid #d1d5db;
          padding-bottom: 4px;
        }

        .info-block p {
          margin: 4px 0;
        }

        .table-container {
          width: 100%;
          overflow-x: auto;
          margin: 12px 0;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          table-layout: fixed;
        }

        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 8px 6px;
          word-wrap: break-word;
        }

        .items-table th {
          background: #e0f2fe;
          font-weight: 600;
          text-align: center;
        }

        .items-table td:first-child {
          text-align: center;
        }

        .items-table td:nth-child(2) {
          text-align: left;
        }

        .items-table td:nth-child(3) {
          text-align: center;
          font-weight: bold;
        }

        .items-table td:last-child {
          text-align: center;
        }

        .quantity-cell {
          font-weight: bold;
        }

        .no-data {
          text-align: center;
          padding: 20px;
          color: #6b7280;
        }

        .report-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          font-size: 12px;
        }

        .signature-section, .authorized-section {
          width: 45%;
        }

        .signature-line {
          margin-top: 40px;
          border-top: 1px solid #000;
          text-align: center;
          padding-top: 8px;
        }

        @media print {
          .no-print { display: none !important; }
          .modal-overlay, .modal-content {
            background: white !important;
            box-shadow: none !important;
            max-height: none;
            overflow: visible;
          }
          .report-wrapper {
            padding: 0;
            background: white;
          }
          .a4-page {
            margin: 0;
            box-shadow: none;
            page-break-after: always;
            padding: 5mm;
          }
          .a4-page:last-child {
            page-break-after: avoid;
          }
          .table-container {
            overflow: visible;
          }
        }

        @media screen and (max-width: 768px) {
          .modal-content {
            max-width: 100%;
            margin: 0;
          }
          
          .a4-page {
            width: 100%;
            padding: 5mm;
          }
          
          .dispatch-info-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          
          .items-table {
            font-size: 11px;
          }
          
          .items-table th,
          .items-table td {
            padding: 6px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default DispatchReportConsumable;