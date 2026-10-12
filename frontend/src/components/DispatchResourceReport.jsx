import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

const DispatchResourceReport = ({ dispatchData = {}, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the passed dispatch data (single dispatch object)
  const {
    consumable_name = 'N/A',
    quantity = 'N/A',
    current_site = 'N/A',
    destination_site = 'N/A',
    dispatch_date = 'N/A',
    vehicle_name_model = 'N/A',
    vehicle_number = 'N/A',
    driver_name = 'N/A',
    driver_mobile = 'N/A',
    transport_amount = 0,
    created_at = null,
    created_by_name = 'System',
  } = dispatchData;

  // Format dates (same style as DispatchReport)
  const dispatchDateDisplay = dispatch_date !== 'N/A'
    ? new Date(dispatch_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const dcDate = created_at
    ? new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'N/A';

  // For consistency with your original - we treat it as single "material" (consumable)
  const materials = [{
    item_name: consumable_name,
    quantity: quantity,
    uom_name: 'Nos', // or fetch from master if you have uom
    remarks: `From: ${current_site} → To: ${destination_site}`,
    created_at: created_at,
  }];

  const materialsPerPage = 5;
  const materialChunks = [];
  for (let i = 0; i < materials.length; i += materialsPerPage) {
    materialChunks.push(materials.slice(i, i + materialsPerPage));
  }
  if (materialChunks.length === 0) {
    materialChunks.push([]);
  }

  // Download PDF (exact same logic as your DispatchReport)
  const handleDownloadPDF = () => {
    const element = document.getElementById('report-content');
    if (!element) {
      console.error('Element with ID "report-content" not found');
      return;
    }

    const opt = {
      margin: [0.2, 0.2],
      filename: `resource_dispatch_${dispatchData.id || 'report'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const images = clonedDoc.querySelectorAll('img');
          const promises = Array.from(images).map(img => {
            if (!img.complete) {
              return new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }
            return Promise.resolve();
          });
          return Promise.all(promises);
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        hotfixes: ['px_scaling']
      },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      console.log('PDF generated successfully');
    }).catch(err => {
      console.error('PDF generation failed:', err);
    });
  };

  const handleCloseModal = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // Address section - similar to your original (you can customize later)
  const renderAddressSection = () => {
    if (loading) return <div>Loading recipient details...</div>;
    if (error) return <div>{error}</div>;

    return (
      <div>
        <span className="address-label">To </span>
        <span className="recipient-name">Site Incharge / Store</span><br />
        <span className="recipient-phone">(PH.No. —)</span><br />
        {current_site} → {destination_site}<br />
        GSTIN: — (Resource Dispatch)
      </div>
    );
  };

  // Page header (same as your DispatchReport)
  const renderPageHeader = () => (
    <div className="page-header">
      <table className="header-table">
        <tbody>
          <tr>
            <td colSpan={5} className="header-logo">
              <img src="/logo_abstract.png" alt="Logo" className="logo-img" />
              <span className="company-name">
                SATHYA HITEC SOLUTIONS LLP
              </span>
            </td>
          </tr>
          <tr>
            <td colSpan={5} className="company-address">
              222, Chinnammal Nagar, Edayarpalayam, Vadavalli Road, Coimbatore - 641041<br />
              Ph.No. 0422 2401231, 9600555870 E-mail: sathyaec@gmail.com<br />
              FACTORY : BHAGAVATHIPALAYAM, KINATHUKADAVU, COIMBATORE 642 109<br />
              GSTIN: 33ACJFS1582J1ZW
            </td>
          </tr>
          <tr>
            <td colSpan={5} className="document-title">
              RESOURCE DISPATCH CHALLAN
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Materials table (adapted for single consumable dispatch)
  const renderMaterialsTable = (materialsChunk, pageIndex) => (
    <table className="materials-table">
      <thead>
        <tr>
          <td className="table-header" width="5%">Sl.No</td>
          <td className="table-header" width="32%">Particulars</td>
          <td className="table-header" width="9%">Qty</td>
          <td className="table-header" width="8%">UOM</td>
          <td className="table-header" width="30%">Remarks</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="empty-cell"></td>
          <td className="mtf-work-label" colSpan={4}>Resource Dispatch :</td>
        </tr>
        {materialsChunk.length > 0 ? materialsChunk.map((material, index) => {
          const globalIndex = pageIndex * materialsPerPage + index + 1;
          return (
            <tr key={globalIndex}>
              <td className="cell-center">{globalIndex}</td>
              <td className="cell-left">
                {material.item_name || consumable_name || 'N/A'}
              </td>
              <td className="cell-left-bold">
                <span className="highlighted-qty">{material.quantity || quantity || '0'}</span>
              </td>
              <td className="cell-left">
                {material.uom_name || 'Nos'}
              </td>
              <td className="cell-left">
                From: {current_site || '—'}<br />
                To: {destination_site || '—'}<br />
                Vehicle: {vehicle_name_model || '—'} ({vehicle_number || '—'})<br />
                Driver: {driver_name || '—'} ({driver_mobile || '—'})
              </td>
            </tr>
          );
        }) : (
          <tr>
            <td colSpan={5} className="cell-left">No dispatch details available</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Footer (same as your original)
  const renderFooterSection = (isLastPage) => (
    <table className="footer-section-table">
      <tbody>
        {isLastPage && (
          <tr>
            <td colSpan={5} className="returnable-note">
              The above resource sent for our project purpose on returnable / non-returnable basis
            </td>
          </tr>
        )}
        <tr>
          <td colSpan={2} className="footer-left">
            <div className="gst-label">GSTIN NO.</div>
            <div className="gst-number">33ACJFS1582J1ZW</div>
          </td>
          <td colSpan={3} className="footer-right">
            <div className="signature-label">for Sathya Hitec Solutions LLP</div>
            <div className="signature-text">Authorised Signatory</div>
          </td>
        </tr>
      </tbody>
    </table>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="dispatch-report-container">
          <div className="download-btn-container">
            <button
              onClick={handleDownloadPDF}
              className="download-btn no-print"
            >
              Download as PDF
            </button>
            <button
              onClick={handleCloseModal}
              className="cancel-btn no-print"
            >
              Cancel
            </button>
          </div>

          <div id="report-content" className="report-content">
            <div className="a4-container">
              {materialChunks.map((chunk, pageIndex) => (
                <div key={pageIndex} className="page">
                  {renderPageHeader()}

                  <table className="main-content-table">
                    <tbody>
                      {/* Address & Details - only first page */}
                      {pageIndex === 0 && (
                        <tr>
                          <td colSpan={2} className="address-section">
                            {renderAddressSection()}
                          </td>
                          <td colSpan={3} className="details-section">
                            <table className="details-table">
                              <tbody>
                                <tr>
                                  <td className="details-label">Dispatch Challan</td>
                                  <td className="details-value"></td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Dispatch ID</td>
                                  <td className="details-value-bold">{dispatchData.id || '—'}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Dispatch Date</td>
                                  <td className="details-value-bold">{dispatchDateDisplay}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">DC Date</td>
                                  <td className="details-value-bold">{dcDate}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">From Site</td>
                                  <td className="details-value">{current_site}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">To Site</td>
                                  <td className="details-value">{destination_site}</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}

                      {/* Materials Table */}
                      <tr>
                        <td colSpan={5} className="materials-container">
                          {renderMaterialsTable(chunk, pageIndex)}
                        </td>
                      </tr>

                      {/* Footer - only last page */}
                      {pageIndex === materialChunks.length - 1 && (
                        <tr>
                          <td colSpan={5} className="footer-container">
                            {renderFooterSection(true)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Page number */}
                  <div className="page-number">
                    Page {pageIndex + 1} of {materialChunks.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Same styles as your DispatchReport */}
        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            background-color: #f1f5f9;
            max-width: 60rem;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border-radius: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }
          .dispatch-report-container {
            background-color: #f1f5f9;
            min-height: 100%;
            padding: 24px;
          }
          .download-btn-container {
            text-align: right;
            margin-bottom: 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          .download-btn {
            background-color: #2563eb;
            color: white;
            padding: 8px 24px;
            border-radius: 0;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .download-btn:hover {
            background-color: #1d4ed8;
          }
          .cancel-btn {
            background-color: #e5e7eb;
            color: #1f2937;
            padding: 8px 24px;
            border-radius: 0;
            border: none;
            cursor: pointer;
            font-size: 14px;
          }
          .cancel-btn:hover {
            background-color: #d1d5db;
          }
          .report-content {
            max-width: 56rem;
            margin-left: auto;
            margin-right: auto;
            background-color: white;
            padding: 0;
            border-radius: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border: 1px solid #d1d5db;
          }
          
          .a4-container {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: white;
            position: relative;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 8mm;
            box-sizing: border-box;
            border: 2px solid #000000;
            position: relative;
            background: white;
            display: flex;
            flex-direction: column;
          }
          
          .page + .page {
            margin-top: 2mm;
          }
          
          .page-header {
            margin-bottom: 6px;
          }
          
          .main-content-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .materials-container, .footer-container {
            padding: 0;
            vertical-align: top;
          }
          
          .header-table, .materials-table, .footer-section-table {
            width: 100%;
            border: 1px solid #000000;
            font-size: 14px;
            border-collapse: collapse;
            margin-bottom: 0;
          }
          
          .header-logo {
            text-align: center;
            padding: 8px 0;
            border: none;
          }
          .logo-img {
            height: 40px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 12px;
          }
          .company-name {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.025em;
            color: #0369a1;
            vertical-align: middle;
          }
          .company-address {
            text-align: center;
            font-size: 12px;
            padding: 4px 0;
            border: none;
            color: #0369a1;
            line-height: 1.3;
          }
          .document-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            border: 1px solid #000000;
            padding: 6px 0;
            background-color: #e0f2fe;
          }
          
          .address-section {
            vertical-align: top;
            border: 1px solid #000000;
            padding: 8px;
            width: 60%;
            font-size: 13px;
          }
          .address-label {
            font-weight: 600;
          }
          .recipient-name {
            color: black;
            font-weight: bold;
            margin-left: 4px;
          }
          .recipient-phone {
            font-weight: bold;
            font-size: 12px;
            color: #ef4444;
            padding-left: 20px;
          }
          .details-section {
            vertical-align: top;
            border: 1px solid #000000;
            padding: 0;
            width: 40%;
          }
          .details-table {
            width: 100%;
            font-size: 12px;
            border-collapse: collapse;
          }
          .details-label {
            font-weight: 600;
            border: 1px solid #000000;
            padding: 4px 6px;
          }
          .details-label-bold {
            font-weight: bold;
            border: 1px solid #000000;
            padding: 4px 6px;
          }
          .details-value {
            border: 1px solid #000000;
            padding: 4px 6px;
          }
          .details-value-bold {
            font-weight: bold;
            border: 1px solid #000000;
            padding: 4px 6px;
          }
          
          .table-header {
            border: 1px solid #000000;
            text-align: center;
            font-weight: bold;
            padding: 6px;
            background-color: #7dd3fc;
            font-size: 13px;
          }
          .empty-cell {
            padding: 6px;
          }
          .mtf-work-label {
            border: 1px solid #000000;
            font-size: 14px;
            padding: 8px;
            font-weight: 600;
            color: #dc2626;
          }
          .cell-center {
            border: 1px solid #000000;
            text-align: center;
            padding: 8px;
            font-size: 13px;
            height: 45px;
            vertical-align: top;
          }
          .cell-left {
            border: 1px solid #000000;
            text-align: left;
            padding: 8px;
            vertical-align: top;
            font-size: 13px;
            height: 45px;
          }
          .cell-left-bold {
            border: 1px solid #000000;
            text-align: left;
            padding: 8px;
            font-weight: bold;
            vertical-align: top;
            font-size: 13px;
            height: 45px;
          }
          .highlighted-qty {
            background-color: #f8e71c;
            display: inline-block;
            min-width: 35px;
            margin-top: 2px;
            text-align: center;
            padding: 2px 4px;
            font-size: 13px;
          }
          
          .footer-section-table {
            width: 100%;
            border: 1px solid #000000;
            border-collapse: collapse;
            margin-top: 0;
          }
          
          .returnable-note {
            border: 1px solid #000000;
            text-align: left;
            padding: 6px;
            color: #dc2626;
            font-weight: bold;
            text-decoration: underline;
            font-size: 13px;
          }
          .footer-left {
            vertical-align: middle;
            width: 60%;
            padding: 8px;
            border: 1px solid #000000;
          }
          .gst-label {
            background-color: #bae6fd;
            padding: 4px 8px;
            border-radius: 0;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 4px;
            font-size: 12px;
          }
          .gst-number {
            font-weight: 800;
            font-size: 16px;
            letter-spacing: 0.05em;
            color: #1e40af;
            margin-bottom: 2px;
          }
          .footer-right {
            vertical-align: middle;
            width: 40%;
            padding: 8px;
            text-align: right;
            border: 1px solid #000000;
          }
          .signature-label {
            margin-bottom: 20px;
            margin-top: 4px;
            padding-right: 8px;
            font-size: 13px;
          }
          .signature-text {
            font-size: 12px;
            padding-right: 30px;
          }
          
          .page-number {
            position: absolute;
            bottom: 5mm;
            right: 8mm;
            font-size: 12px;
            color: #666;
            font-weight: bold;
          }
          
          @media print {
            .no-print {
              display: none !important;
            }
            .modal-overlay {
              position: static;
              background-color: transparent;
              display: block;
            }
            .modal-content {
              box-shadow: none;
              max-height: none;
              border-radius: 0;
              width: 100%;
              max-width: none;
              display: block;
            }
            .dispatch-report-container {
              padding: 0;
              display: block;
            }
            .report-content {
              box-shadow: none;
              border: none;
              margin: 0;
              max-width: none;
              display: block;
            }
            .a4-container {
              width: 100%;
              min-height: 297mm;
              display: block;
            }
            .page {
              border: 2px solid #000000;
              margin: 0;
              box-shadow: none;
              page-break-after: always;
              display: block;
            }
            .page:last-child {
              page-break-after: auto;
            }
            thead { display: table-header-group; }
            tbody { display: table-row-group; }
          }
          
          @media (max-width: 768px) {
            .modal-content {
              width: 90%;
              max-height: 85vh;
            }
            .download-btn-container {
              flex-direction: column;
              gap: 8px;
            }
            .download-btn, .cancel-btn {
              width: 100%;
            }
            .a4-container {
              width: 100%;
              transform: scale(0.8);
              transform-origin: top center;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DispatchResourceReport;