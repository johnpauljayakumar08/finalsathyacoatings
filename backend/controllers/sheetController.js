const { format, isAfter } = require("date-fns");
const db = require("../config/db");

const {
  createConsumable,
  getAllConsumable,
  getConsumableById,
  updateConsumable,
  deleteConsumable,
  getNewSites,
  appendDateRangeToReportMaster,
  getSiteDateRange,
  getReportsBySite,
  getCategoriesForSite,
  getSubcategoriesForCategory,
  createDynamicTableStructure,
  syncReportIdsToDynamicTable,
  addDynamicColumn,
  checkSiteInPoReckoner,
  checkSiteInReportMaster,
  getSiteCategoriesAndSubcategories,
  getReportIdsForSite,
  getDynamicTableData,
  getDynamicTableDataByReportType,
  updateWorksheetData,
  getSiteDetails
} = require("../models/sheetModel");

exports.createConsumable = async (req, res) => {
  try {
    const { consumable_name } = req.body;
    if (!consumable_name) {
      return res.status(400).json({ message: "Consumable name is required" });
    }

    const consumableId = await createConsumable(consumable_name);
    res.status(201).json({
      message: "Consumable createConsumabled successfully",
      consumable_id: consumableId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating consumable" });
  }
};

exports.getAllConsumable = async (req, res) => {
  try {
    const consumables = await getAllConsumable();
    res.status(200).json(consumables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching consumables" });
  }
};

exports.getConsumableById = async (req, res) => {
  try {
    const { id } = req.params;
    const consumable = await getConsumableById(id);

    if (!consumable) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res.status(200).json(consumable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching consumable" });
  }
};

exports.updateConsumable = async (req, res) => {
  try {
    const { id } = req.params;
    const { consumable_name } = req.body;

    if (!consumable_name) {
      return res.status(400).json({ message: "Consumable name is required" });
    }

    const isUpdated = await updateConsumable(id, consumable_name);

    if (!isUpdated) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res
      .status(200)
      .json({ message: "Consumable updateConsumabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating consumable" });
  }
};

exports.deleteConsumable = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await deleteConsumable(id);

    if (!isDeleted) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    res
      .status(200)
      .json({ message: "Consumable deleteConsumabled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting consumable" });
  }
};

exports.processSiteReports = async (req, res) => {
  try {
    // Get only new sites (those in po_reckoner but not in report_master)
    const newSites = await getNewSites();
    const results = [];

    if (newSites.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "No new sites to process - all sites already exist in report_master",
        data: [],
      });
    }

    for (const site of newSites) {
      const siteId = site.site_id;
      const siteResult = {
        site_id: siteId,
        tables_processed: [],
      };

      const siteDetails = await getSiteDateRange(siteId);

      if (!siteDetails) {
        siteResult.report_status = "skipped";
        siteResult.report_reason = "No site details found";
        results.push(siteResult);
        continue;
      }

      let { start_date, end_date } = siteDetails;
      start_date = format(new Date(start_date), "yyyy-MM-dd");
      end_date = format(new Date(end_date), "yyyy-MM-dd");

      if (isAfter(new Date(start_date), new Date(end_date))) {
        siteResult.report_status = "skipped";
        siteResult.report_reason = "End date is before start date";
        results.push(siteResult);
        continue;
      }

      try {
        // Append dates to report_master (won't process if site exists)
        const reportMasterResult = await appendDateRangeToReportMaster(
          siteId,
          start_date,
          end_date
        );

        if (reportMasterResult.status === "skipped") {
          siteResult.report_status = "skipped";
          siteResult.report_reason = reportMasterResult.reason;
          results.push(siteResult);
          continue;
        }

        siteResult.report_status = "processed";
        siteResult.dates_generated = reportMasterResult.datesGenerated;
        siteResult.report_ids = reportMasterResult.reportIds;

        // Process dynamic tables for each category
        const categories = await getCategoriesForSite(siteId);

        for (const category of categories) {
          const tableResult = {
            category_id: category.category_id,
            category_name: category.category_name,
            table_status: "",
            report_sync: {},
            columns: [],
          };

          // Create table structure if not exists
          const tableCreation = await createDynamicTableStructure(
            category.category_name
          );
          tableResult.table_status = tableCreation.status;

          // Sync report_ids to the table
          if (
            tableCreation.status === "exists" ||
            tableCreation.status === "created"
          ) {
            const syncResult = await syncReportIdsToDynamicTable(
              category.category_name,
              siteId
            );

            tableResult.report_sync = {
              status: syncResult.status,
              report_ids_processed: syncResult.report_ids_processed || 0,
              combinations_added: syncResult.combinations_added || 0,
              type_ids_used: syncResult.type_ids_used || [],
            };
          }

          // Process subcategories (columns)
          const subcategories = await getSubcategoriesForCategory(
            siteId,
            category.category_id
          );

          for (const subcategory of subcategories) {
            const columnResult = await addDynamicColumn(
              category.category_name,
              subcategory.subcategory_name
            );

            tableResult.columns.push({
              subcategory_id: subcategory.subcategory_id,
              subcategory_name: subcategory.subcategory_name,
              status: columnResult.status,
            });
          }

          siteResult.tables_processed.push(tableResult);
        }
      } catch (error) {
        siteResult.report_status = "error";
        siteResult.error = error.message;
      }

      results.push(siteResult);
    }

    res.status(200).json({
      success: true,
      message: "New site processing completed",
      data: results,
    });
  } catch (error) {
    console.error("Error processing site reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process site reports",
      error: error.message,
    });
  }
};



// exports.processSiteReportsById = async (req, res) => {
//   try {
//     const { site_id } = req.params;
//     const results = [];

//     // Check if site exists in po_reckoner
//     const siteCheck = await checkSiteInPoReckoner(site_id);

//     if (!siteCheck || siteCheck.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Site not found in po_reckoner",
//       });
//     }

//     const siteResult = {
//       site_id: site_id,
//       tables_processed: [],
//     };

//     // Check if site already exists in report_master
//     const existing = await checkSiteInReportMaster(site_id);
//     if (existing > 0) {
//       siteResult.report_status = "skipped";
//       siteResult.report_reason = "Site already exists in report_master";
//       results.push(siteResult);
//       return res.status(200).json({
//         success: true,
//         message: "Site already processed",
//         data: results,
//       });
//     }

//     const siteDetails = await getSiteDateRange(site_id);

//     if (!siteDetails) {
//       siteResult.report_status = "skipped";
//       siteResult.report_reason = "No site details found";
//       results.push(siteResult);
//       return res.status(404).json({
//         success: false,
//         message: "No site details found",
//         data: results,
//       });
//     }

//     let { start_date, end_date } = siteDetails;
//     start_date = format(new Date(start_date), "yyyy-MM-dd");
//     end_date = format(new Date(end_date), "yyyy-MM-dd");

//     if (isAfter(new Date(start_date), new Date(end_date))) {
//       siteResult.report_status = "skipped";
//       siteResult.report_reason = "End date is before start date";
//       results.push(siteResult);
//       return res.status(400).json({
//         success: false,
//         message: "End date is before start date",
//         data: results,
//       });
//     }

//     try {
//       // Append dates to report_master
//       const reportMasterResult = await appendDateRangeToReportMaster(
//         site_id,
//         start_date,
//         end_date
//       );

//       if (reportMasterResult.status === "skipped") {
//         siteResult.report_status = "skipped";
//         siteResult.report_reason = reportMasterResult.reason;
//         results.push(siteResult);
//         return res.status(200).json({
//           success: true,
//           message: reportMasterResult.reason,
//           data: results,
//         });
//       }

//       siteResult.report_status = "processed";
//       siteResult.dates_generated = reportMasterResult.datesGenerated;
//       siteResult.report_ids = reportMasterResult.reportIds;

//       // Process dynamic tables for each category
//       const categories = await getCategoriesForSite(site_id);

//       for (const category of categories) {
//         const tableResult = {
//           category_id: category.category_id,
//           category_name: category.category_name,
//           table_status: "",
//           report_sync: {},
//           columns: [],
//         };

//         // Create table structure if not exists
//         const tableCreation = await createDynamicTableStructure(
//           category.category_name
//         );
//         tableResult.table_status = tableCreation.status;

//         // Sync report_ids to the table
//         if (
//           tableCreation.status === "exists" ||
//           tableCreation.status === "created"
//         ) {
//           const syncResult = await syncReportIdsToDynamicTable(
//             category.category_name,
//             site_id
//           );

//           tableResult.report_sync = {
//             status: syncResult.status,
//             report_ids_processed: syncResult.report_ids_processed || 0,
//             combinations_added: syncResult.combinations_added || 0,
//             type_ids_used: syncResult.type_ids_used || [],
//           };
//         }

//         // Process subcategories (columns)
//         const subcategories = await getSubcategoriesForCategory(
//           site_id,
//           category.category_id
//         );

//         for (const subcategory of subcategories) {
//           const columnResult = await addDynamicColumn(
//             category.category_name,
//             subcategory.subcategory_name
//           );

//           tableResult.columns.push({
//             subcategory_id: subcategory.subcategory_id,
//             subcategory_name: subcategory.subcategory_name,
//             status: columnResult.status,
//           });
//         }

//         siteResult.tables_processed.push(tableResult);
//       }

//       results.push(siteResult);

//       res.status(200).json({
//         success: true,
//         message: "Site processing completed",
//         data: results,
//       });
//     } catch (error) {
//       siteResult.report_status = "error";
//       siteResult.error = error.message;
//       results.push(siteResult);
//       res.status(500).json({
//         success: false,
//         message: "Error processing site",
//         error: error.message,
//         data: results,
//       });
//     }
//   } catch (error) {
//     console.error("Error processing site reports by ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to process site reports",
//       error: error.message,
//     });
//   }
// };



exports.processSiteReportsByPO = async (req, res) => {
  try {
    const { po_number } = req.params; // Changed from site_id to po_number
    const results = [];

    // First, get site_id from site_details using po_number
    const siteDetails = await getSiteByPoNumber(po_number);
    
    if (!siteDetails || !siteDetails.site_id) {
      return res.status(404).json({
        success: false,
        message: "Site not found with the provided PO number",
      });
    }

    const site_id = siteDetails.site_id;

    // Check if site exists in po_reckoner
    const siteCheck = await checkSiteInPoReckoner(site_id);

    if (!siteCheck || siteCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Site not found in po_reckoner",
      });
    }

    const siteResult = {
      po_number: po_number, // Include PO number in response
      site_id: site_id,
      tables_processed: [],
    };

    // Check if site already exists in report_master
    const existing = await checkSiteInReportMaster(site_id);
    if (existing > 0) {
      siteResult.report_status = "skipped";
      siteResult.report_reason = "Site already exists in report_master";
      results.push(siteResult);
      return res.status(200).json({
        success: true,
        message: "Site already processed",
        data: results,
      });
    }

    const siteDateRange = await getSiteDateRange(site_id);

    if (!siteDateRange) {
      siteResult.report_status = "skipped";
      siteResult.report_reason = "No site details found";
      results.push(siteResult);
      return res.status(404).json({
        success: false,
        message: "No site details found",
        data: results,
      });
    }

    let { start_date, end_date } = siteDateRange;
    start_date = format(new Date(start_date), "yyyy-MM-dd");
    end_date = format(new Date(end_date), "yyyy-MM-dd");

    if (isAfter(new Date(start_date), new Date(end_date))) {
      siteResult.report_status = "skipped";
      siteResult.report_reason = "End date is before start date";
      results.push(siteResult);
      return res.status(400).json({
        success: false,
        message: "End date is before start date",
        data: results,
      });
    }

    try {
      // Append dates to report_master
      const reportMasterResult = await appendDateRangeToReportMaster(
        site_id,
        start_date,
        end_date
      );

      if (reportMasterResult.status === "skipped") {
        siteResult.report_status = "skipped";
        siteResult.report_reason = reportMasterResult.reason;
        results.push(siteResult);
        return res.status(200).json({
          success: true,
          message: reportMasterResult.reason,
          data: results,
        });
      }

      siteResult.report_status = "processed";
      siteResult.dates_generated = reportMasterResult.datesGenerated;
      siteResult.report_ids = reportMasterResult.reportIds;

      // Process dynamic tables for each category
      const categories = await getCategoriesForSite(site_id);

      for (const category of categories) {
        const tableResult = {
          category_id: category.category_id,
          category_name: category.category_name,
          table_status: "",
          report_sync: {},
          columns: [],
        };

        // Create table structure if not exists
        const tableCreation = await createDynamicTableStructure(
          category.category_name
        );
        tableResult.table_status = tableCreation.status;

        // Sync report_ids to the table
        if (
          tableCreation.status === "exists" ||
          tableCreation.status === "created"
        ) {
          const syncResult = await syncReportIdsToDynamicTable(
            category.category_name,
            site_id
          );

          tableResult.report_sync = {
            status: syncResult.status,
            report_ids_processed: syncResult.report_ids_processed || 0,
            combinations_added: syncResult.combinations_added || 0,
            type_ids_used: syncResult.type_ids_used || [],
          };
        }

        // Process subcategories (columns)
        const subcategories = await getSubcategoriesForCategory(
          site_id,
          category.category_id
        );

        for (const subcategory of subcategories) {
          const columnResult = await addDynamicColumn(
            category.category_name,
            subcategory.subcategory_name
          );

          tableResult.columns.push({
            subcategory_id: subcategory.subcategory_id,
            subcategory_name: subcategory.subcategory_name,
            status: columnResult.status,
          });
        }

        siteResult.tables_processed.push(tableResult);
      }

      results.push(siteResult);

      res.status(200).json({
        success: true,
        message: "Site processing completed",
        data: results,
      });
    } catch (error) {
      siteResult.report_status = "error";
      siteResult.error = error.message;
      results.push(siteResult);
      res.status(500).json({
        success: false,
        message: "Error processing site",
        error: error.message,
        data: results,
      });
    }
  } catch (error) {
    console.error("Error processing site reports by PO number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process site reports",
      error: error.message,
    });
  }
};

// Helper function to get site by PO number
async function getSiteByPoNumber(po_number) {
  const query = 'SELECT site_id FROM site_details WHERE po_number = ? LIMIT 1';
  const [rows] = await db.query(query, [po_number]);
  return rows[0] || null;
}


exports.getSiteReports = async (req, res) => {
  try {
    const { site_id } = req.params;
    const reports = await getReportsBySite(site_id);

    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reports found for this site",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        site_id: site_id,
        site_name: reports[0].site_name,
        start_date: reports[0].date,
        end_date: reports[reports.length - 1].date,
        total_days: reports.length,
        reports: reports.map((r) => ({
          report_id: r.report_id,
          date: r.date,
          site_id: r.site_id,
          site_name: r.site_name,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching site reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch site reports",
      error: error.message,
    });
  }
};




































// the below modules is for fetching worksheet data [rows columns]

exports.getWorksheetData = async (req, res) => {
  try {
    const { site_id } = req.params;

    // 1. Get all categories and subcategories for the site
    const categories = await getSiteCategoriesAndSubcategories(site_id);
    
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found for this site",
      });
    }

    // 2. Get all report_ids for the site
    const reportIds = await getReportIdsForSite(site_id);
    
    if (!reportIds || reportIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reports found for this site",
      });
    }

    // 3. Group categories and subcategories
    const groupedCategories = {};
    categories.forEach(item => {
      if (!groupedCategories[item.category_id]) {
        groupedCategories[item.category_id] = {
          category_id: item.category_id,
          category_name: item.category_name,
          sanitized_name: sanitizeName(item.category_name),
          subcategories: []
        };
      }
      
      // Check if subcategory already exists to avoid duplicates
      const subcatExists = groupedCategories[item.category_id].subcategories.some(
        sub => sub.subcategory_id === item.subcategory_id
      );
      
      if (!subcatExists) {
        groupedCategories[item.category_id].subcategories.push({
          subcategory_id: item.subcategory_id,
          subcategory_name: item.subcategory_name,
          sanitized_name: sanitizeName(item.subcategory_name)
        });
      }
    });

    // 4. Get data for each dynamic table
    const result = {
      site_id: site_id,
      report_ids: reportIds,
      categories: []
    };

    for (const categoryId in groupedCategories) {
      const category = groupedCategories[categoryId];
      try {
        const tableData = await getDynamicTableData(category.category_name, reportIds);
        
        result.categories.push({
          category_id: category.category_id,
          category_name: category.category_name,
          table_name: category.sanitized_name,
          subcategories: category.subcategories,
          table_data: tableData
        });
      } catch (error) {
        console.error(`Error processing category ${category.category_name}:`, error);
        result.categories.push({
          category_id: category.category_id,
          category_name: category.category_name,
          table_name: category.sanitized_name,
          error: `Failed to fetch table data: ${error.message}`,
          subcategories: category.subcategories
        });
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching worksheet data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worksheet data",
      error: error.message,
    });
  }
};

// filter by report_type_id
// exports.getWorksheetDataByReportType = async (req, res) => {
//   try {
//     const { site_id, report_type_id } = req.params;

//     // 1. Get all categories and subcategories for the site
//     const categories = await getSiteCategoriesAndSubcategories(site_id);
    
//     if (!categories || categories.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No categories found for this site",
//       });
//     }

//     // 2. Group categories and subcategories
//     const groupedCategories = {};
//     categories.forEach(item => {
//       if (!groupedCategories[item.category_id]) {
//         groupedCategories[item.category_id] = {
//           category_id: item.category_id,
//           category_name: item.category_name,
//           sanitized_name: sanitizeName(item.category_name),
//           subcategories: []
//         };
//       }
      
//       // Check if subcategory already exists to avoid duplicates
//       const subcatExists = groupedCategories[item.category_id].subcategories.some(
//         sub => sub.subcategory_id === item.subcategory_id
//       );
      
//       if (!subcatExists) {
//         groupedCategories[item.category_id].subcategories.push({
//           subcategory_id: item.subcategory_id,
//           subcategory_name: item.subcategory_name,
//           sanitized_name: sanitizeName(item.subcategory_name)
//         });
//       }
//     });

//     // 3. Get data for each dynamic table
//     const result = {
//       site_id: site_id,
//       report_type_id: parseInt(report_type_id),
//       categories: []
//     };

//     for (const categoryId in groupedCategories) {
//       const category = groupedCategories[categoryId];
//       const categoryResult = {
//         category_id: category.category_id,
//         category_name: category.category_name,
//         table_name: category.sanitized_name,
//         subcategories: []
//       };

//       // Process each subcategory
//       for (const subcategory of category.subcategories) {
//         try {
//           const tableData = await getDynamicTableDataByReportType(
//             category.category_name, 
//             site_id, 
//             report_type_id,
//             category.category_id,
//             subcategory.subcategory_id
//           );
          
//           categoryResult.subcategories.push({
//             subcategory_id: subcategory.subcategory_id,
//             subcategory_name: subcategory.subcategory_name,
//             table_data: tableData
//           });
//         } catch (error) {
//           console.error(`Error processing subcategory ${subcategory.subcategory_name}:`, error);
//           categoryResult.subcategories.push({
//             subcategory_id: subcategory.subcategory_id,
//             subcategory_name: subcategory.subcategory_name,
//             error: `Failed to fetch table data: ${error.message}`
//           });
//         }
//       }

//       result.categories.push(categoryResult);
//     }

//     res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (error) {
//     console.error("Error fetching worksheet data by report type:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch worksheet data",
//       error: error.message,
//     });
//   }
// };









// filter by report_type_id
// exports.getWorksheetDataByReportType = async (req, res) => {
//   try {
//     const { site_id, report_type_id } = req.params;

//     // 1. Get all categories and subcategories for the site
//     const categories = await getSiteCategoriesAndSubcategories(site_id);
    
//     if (!categories || categories.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No categories found for this site",
//       });
//     }

//     // 2. Get the report type name
//     const [reportType] = await db.query(
//       `SELECT type_name 
//        FROM report_type 
//        WHERE type_id = ?`,
//       [report_type_id]
//     );
//     const typeName = reportType[0]?.type_name || 'reports';

//     // 3. Group categories and subcategories
//     const groupedCategories = {};
//     categories.forEach(item => {
//       if (!groupedCategories[item.category_id]) {
//         groupedCategories[item.category_id] = {
//           category_id: item.category_id,
//           category_name: item.category_name,
//           sanitized_name: sanitizeName(item.category_name),
//           subcategories: []
//         };
//       }
      
//       // Check if subcategory already exists to avoid duplicates
//       const subcatExists = groupedCategories[item.category_id].subcategories.some(
//         sub => sub.subcategory_id === item.subcategory_id
//       );
      
//       if (!subcatExists) {
//         groupedCategories[item.category_id].subcategories.push({
//           subcategory_id: item.subcategory_id,
//           subcategory_name: item.subcategory_name,
//           sanitized_name: sanitizeName(item.subcategory_name)
//         });
//       }
//     });

//     // 4. Get data for each dynamic table
//     const result = {
//       site_id: site_id,
//       report_type_id: parseInt(report_type_id),
//       report_type_name: typeName, // Add report type name to response
//       categories: []
//     };

//     for (const categoryId in groupedCategories) {
//       const category = groupedCategories[categoryId];
//       const categoryResult = {
//         category_id: category.category_id,
//         category_name: category.category_name,
//         table_name: category.sanitized_name,
//         subcategories: []
//       };

//       // Process each subcategory
//       for (const subcategory of category.subcategories) {
//         try {
//           const tableData = await getDynamicTableDataByReportType(
//             category.category_name, 
//             site_id, 
//             report_type_id,
//             category.category_id,
//             subcategory.subcategory_id
//           );
          
//           // Add the report type name to each subcategory for reference
//           categoryResult.subcategories.push({
//             subcategory_id: subcategory.subcategory_id,
//             subcategory_name: subcategory.subcategory_name,
//             table_data: {
//               ...tableData,
//               report_type_name: typeName // Include type name in table data
//             }
//           });
//         } catch (error) {
//           console.error(`Error processing subcategory ${subcategory.subcategory_name}:`, error);
//           categoryResult.subcategories.push({
//             subcategory_id: subcategory.subcategory_id,
//             subcategory_name: subcategory.subcategory_name,
//             error: `Failed to fetch table data: ${error.message}`
//           });
//         }
//       }

//       result.categories.push(categoryResult);
//     }

//     res.status(200).json({
//       success: true,
//       data: result
//     });

//   } catch (error) {
//     console.error("Error fetching worksheet data by report type:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch worksheet data",
//       error: error.message,
//     });
//   }
// };


exports.getWorksheetDataByReportType = async (req, res) => {
  try {
    const { site_id, report_type_id } = req.params;

    // 1. Get site details (site_name and po_number)
    const siteDetails = await getSiteDetails(site_id);

    if (!siteDetails || siteDetails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No site details found for this site_id",
      });
    }

    // 2. Get all categories and subcategories for the site
    const categories = await getSiteCategoriesAndSubcategories(site_id);
    
    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No categories found for this site",
      });
    }

    // 3. Get the report type name
    const [reportType] = await db.query(
      `SELECT type_name 
       FROM report_type 
       WHERE type_id = ?`,
      [report_type_id]
    );
    const typeName = reportType[0]?.type_name || 'reports';

    // 4. Group categories and subcategories
    const groupedCategories = {};
    categories.forEach(item => {
      if (!groupedCategories[item.category_id]) {
        groupedCategories[item.category_id] = {
          category_id: item.category_id,
          category_name: item.category_name,
          sanitized_name: sanitizeName(item.category_name),
          subcategories: []
        };
      }
      
      // Check if subcategory already exists to avoid duplicates
      const subcatExists = groupedCategories[item.category_id].subcategories.some(
        sub => sub.subcategory_id === item.subcategory_id
      );
      
      if (!subcatExists) {
        groupedCategories[item.category_id].subcategories.push({
          subcategory_id: item.subcategory_id,
          subcategory_name: item.subcategory_name,
          sanitized_name: sanitizeName(item.subcategory_name)
        });
      }
    });

    // 5. Get data for each dynamic table
    const result = {
      site_id: site_id,
      site_name: siteDetails[0].site_name, // Add site_name to response
      po_number: siteDetails[0].po_number, // Add po_number to response
      report_type_id: parseInt(report_type_id),
      report_type_name: typeName,
      categories: []
    };

    for (const categoryId in groupedCategories) {
      const category = groupedCategories[categoryId];
      const categoryResult = {
        category_id: category.category_id,
        category_name: category.category_name,
        table_name: category.sanitized_name,
        subcategories: []
      };

      // Process each subcategory
      for (const subcategory of category.subcategories) {
        try {
          const tableData = await getDynamicTableDataByReportType(
            category.category_name, 
            site_id, 
            report_type_id,
            category.category_id,
            subcategory.subcategory_id
          );
          
          // Add the report type name to each subcategory for reference
          categoryResult.subcategories.push({
            subcategory_id: subcategory.subcategory_id,
            subcategory_name: subcategory.subcategory_name,
            table_data: {
              ...tableData,
              report_type_name: typeName
            }
          });
        } catch (error) {
          console.error(`Error processing subcategory ${subcategory.subcategory_name}:`, error);
          categoryResult.subcategories.push({
            subcategory_id: subcategory.subcategory_id,
            subcategory_name: subcategory.subcategory_name,
            error: `Failed to fetch table data: ${error.message}`
          });
        }
      }

      result.categories.push(categoryResult);
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Error fetching worksheet data by report type:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch worksheet data",
      error: error.message,
    });
  }
};


// Helper function (add this at the top with other imports)
function sanitizeName(name) {
  return name.replace(/\s+/g, "_").toLowerCase();
}
















// update datas from worksheet to db table

exports.updateWorksheetData = async (req, res) => {
  try {
    const { site_id, updates } = req.body;

    // Validate request structure
    if (!site_id || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: "Required: site_id and updates array"
      });
    }

    // Validate each update
    const requiredFields = ['report_id', 'report_type_id', 'category_name', 'values'];
    for (const update of updates) {
      if (!requiredFields.every(field => field in update)) {
        return res.status(400).json({
          success: false,
          message: `Each update requires: ${requiredFields.join(', ')}`
        });
      }

      if (typeof update.values !== 'object' || Object.keys(update.values).length === 0) {
        return res.status(400).json({
          success: false,
          message: "Each update must contain values object with at least one column"
        });
      }
    }

    // Process updates
    const results = await updateWorksheetData(site_id, updates);

    res.status(200).json({
      success: true,
      message: "Worksheet data updated successfully",
      data: {
        site_id,
        total_updates: results.length,
        details: results
      }
    });

  } catch (error) {
    console.error("Worksheet update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update worksheet",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
