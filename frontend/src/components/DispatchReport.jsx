import { API_BASE_URL } from "../config/api.js";
import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

const DispatchReport = ({ commonDispatchDetails = {}, dispatchedMaterials = [], onClose }) => {
  // State to store API data
  const [inchargeData, setInchargeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use dynamic dispatch details
  const dispatchDetails = {
    recipient_name: commonDispatchDetails.recipient_name || 'N/A',
    recipient_phone: commonDispatchDetails.recipient_phone || 'N/A',
    recipient_department: commonDispatchDetails.recipient_department || 'N/A',
    recipient_company: commonDispatchDetails.recipient_company || 'N/A',
    recipient_address: commonDispatchDetails.destination || 'N/A',
    recipient_gstin: commonDispatchDetails.gst_number || 'N/A',
    dc_no: commonDispatchDetails.dc_no || 'N/A',
    dispatch_date: commonDispatchDetails.dispatch_date || 'N/A',
    order_no: commonDispatchDetails.order_no || 'N/A',
    order_date: commonDispatchDetails.order_date
      ? new Date(commonDispatchDetails.order_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).split('/').join('.')
      : 'N/A',
    vendor_code: commonDispatchDetails.vendor_code || 'N/A',
    approximate_value: commonDispatchDetails.approximate_value || 'N/A'
  };

  // Get created_at from materials for DC Date
  const createdAt = dispatchedMaterials.length > 0 ? dispatchedMaterials[0].created_at : null;
  const dc_date = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
  const dispatch_date_display = dispatchDetails.dispatch_date !== 'N/A' ? dispatchDetails.dispatch_date : 'N/A';

  // Fetch incharge data from API
  useEffect(() => {
    const fetchInchargeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/material/assigned-incharges`);
        const result = await response.json();
        if (result.status === 'success') {
          const dcDate = new Date(dispatchDetails.dispatch_date);
          const matchingIncharge = result.data.find(item => {
            const fromDate = new Date(item.from_date);
            const toDate = new Date(item.to_date);
            return dcDate >= fromDate && dcDate <= toDate;
          });
          setInchargeData(matchingIncharge || null);
        } else {
          setError('Failed to fetch incharge data');
        }
      } catch (err) {
        console.log(err);
        setError('Error fetching data from API');
      } finally {
        setLoading(false);
      }
    };

    if (dispatchDetails.dispatch_date !== 'N/A') {
      fetchInchargeData();
    } else {
      setLoading(false);
      setInchargeData(null);
    }
  }, [dispatchDetails.dispatch_date]);

  // Split materials into chunks of 5 per page
  const materials = dispatchedMaterials;
  const materialsPerPage = 5;
  const materialChunks = [];
  for (let i = 0; i < materials.length; i += materialsPerPage) {
    materialChunks.push(materials.slice(i, i + materialsPerPage));
  }

  // If no materials, still create one page
  if (materialChunks.length === 0) {
    materialChunks.push([]);
  }

  const handleDownloadPDF = () => {
    console.log('Download button clicked');
    const element = document.getElementById('report-content');
    if (!element) {
      console.error('Element with ID "report-content" not found');
      return;
    }
    console.log('Element found, generating PDF...');
    const opt = {
      margin: [0.2, 0.2],
      filename: `dispatch_report_${dispatchDetails.dc_no}.pdf`,
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
      console.log('PDF generation complete');
    }).catch(err => {
      console.error('PDF generation failed:', err);
    });
  };

  const handleCloseModal = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      console.error('onClose is not a function or is undefined');
    }
  };

  // Determine what to display in the address section
  const renderAddressSection = () => {
    if (loading) {
      return <div>Loading incharge data...</div>;
    }
    if (error) {
      return <div>{error}</div>;
    }
    if (!inchargeData) {
      return <div>No site incharges assigned for this date</div>;
    }
    return (
      <div>
        <span className="address-label">To </span>
        <span className="recipient-name">{inchargeData.full_name}</span> 
        <span className="recipient-phone">(PH.No.{inchargeData.mobile})</span><br />
        {inchargeData.department}<br />
        {inchargeData.current_address}<br />
        GSTIN: {dispatchDetails.recipient_gstin}
      </div>
    );
  };

  // Helper function to format component ratios
  const formatComponentRatios = (comp_ratio_a, comp_ratio_b, comp_ratio_c) => {
    const ratios = [comp_ratio_a, comp_ratio_b];
    if (comp_ratio_c !== null) {
      ratios.push(comp_ratio_c);
    }
    return ` (${ratios.join(':')})`;
  };

  // Render page header (repeated on each page)
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
              DELIVERY CHALLAN
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // Render materials table for a specific chunk
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
          <td className="mtf-work-label" colSpan={4}>MTF Work :</td>
        </tr>
        {materialsChunk.length > 0 ? materialsChunk.map((material, index) => {
          const globalIndex = pageIndex * materialsPerPage + index + 1;
          return (
            <tr key={material.id || index}>
              <td className="cell-center">{globalIndex}</td>
              <td className="cell-left">
                {material.item_name || 'N/A'}{formatComponentRatios(material.comp_ratio_a, material.comp_ratio_b, material.comp_ratio_c)}
                {material.comp_a_qty !== null && <><br /><span className="component">Comp.A</span></>}
                {material.comp_b_qty !== null && <><br /><span className="component">Comp.B</span></>}
                {material.comp_c_qty !== null && <><br /><span className="component">Comp.C</span></>}
              </td>
              <td className="cell-left-bold">
                <span className="highlighted-qty">{material.total_qty || material.dispatch_qty || material.assigned_quantity || '0'}</span>
                {material.comp_a_qty !== null && <><br /><span className="component-qty">{material.comp_a_qty}</span></>}
                {material.comp_b_qty !== null && <><br /><span className="component-qty">{material.comp_b_qty}</span></>}
                {material.comp_c_qty !== null && <><br /><span className="component-qty">{material.comp_c_qty}</span></>}
              </td>
              <td className="cell-left">
                {material.uom_name || 'N/A'}
                {material.comp_a_qty !== null && <><br /><span className="component-uom">{material.uom_name || 'N/A'}</span></>}
                {material.comp_b_qty !== null && <><br /><span className="component-uom">{material.uom_name || 'N/A'}</span></>}
                {material.comp_c_qty !== null && <><br /><span className="component-uom">{material.uom_name || 'N/A'}</span></>}
              </td>
              <td className="cell-left">
                {material.comp_a_remarks && <>{material.comp_a_remarks}<br /></>}
                {material.comp_b_remarks && <>{material.comp_b_remarks}<br /></>}
                {material.comp_c_remarks && <>{material.comp_c_remarks}<br /></>}
              </td>
            </tr>
          );
        }) : (
          <tr>
            <td colSpan={5} className="cell-left">No materials available</td>
          </tr>
        )}
      </tbody>
    </table>
  );

  // Render footer section as part of the main table
  const renderFooterSection = (isLastPage) => (
    <table className="footer-section-table">
      <tbody>
        {isLastPage && (
          <tr>
            <td colSpan={5} className="returnable-note">
              The above materials sent for our works contract purpose on returnable basis
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
              {materialChunks.map((materialsChunk, pageIndex) => (
                <div key={pageIndex} className="page">
                  {renderPageHeader()}
                  
                  {/* Main content table that includes everything */}
                  <table className="main-content-table">
                    <tbody>
                      {/* Address and Details Section - Only on first page */}
                      {pageIndex === 0 && (
                        <tr>
                          <td colSpan={2} className="address-section">
                            {renderAddressSection()}
                          </td>
                          <td colSpan={3} className="details-section">
                            <table className="details-table">
                              <tbody>
                                <tr>
                                  <td className="details-label">Delivery challan</td>
                                  <td className="details-value"></td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">DC NO.</td>
                                  <td className="details-value-bold">{dispatchDetails.dc_no}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Dispatch Date</td>
                                  <td className="details-value-bold">{dispatch_date_display}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">DC Date</td>
                                  <td className="details-value-bold">{dc_date}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Your Order No.</td>
                                  <td className="details-value">{dispatchDetails.order_no}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Your order date</td>
                                  <td className="details-value">{dispatchDetails.order_date}</td>
                                </tr>
                                <tr>
                                  <td className="details-label-bold">Vendor Code</td>
                                  <td className="details-value">{dispatchDetails.vendor_code}</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}

                      {/* Materials Table Row */}
                      <tr>
                        <td colSpan={5} className="materials-container">
                          {renderMaterialsTable(materialsChunk, pageIndex)}
                        </td>
                      </tr>

                      {/* Footer Section - Only on last page */}
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
          
          /* A4 Container Styles */
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
          
          /* Remove problematic page-break CSS that was causing blank pages */
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
          .component {
            padding-left: 8px;
            font-size: 12px;
          }
          .component-qty {
            padding-left: 8px;
            display: inline-block;
            font-size: 12px;
          }
          .component-uom {
            display: inline-block;
            font-size: 12px;
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
            font-weight: bold;
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
          
          /* Print Styles - Fixed to prevent blank pages */
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
            thead {
              display: table-header-group;
            }
            tbody {
              display: table-row-group;
            }
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

export default DispatchReport;