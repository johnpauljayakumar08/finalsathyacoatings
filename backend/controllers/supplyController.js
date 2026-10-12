// supplyController.js
const db = require('../config/db');


exports.test = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'supply management Test API is working',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.assignMaterial = async (req, res) => {
  try {
    const assignments = req.body;
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payload: must be a non-empty array',
      });
    }

    const values = assignments.map(assignment => [
      assignment.pd_id,
      assignment.site_id,
      assignment.item_id,
      assignment.uom_id,
      assignment.quantity,
      assignment.production_cost_per_uom,
      assignment.production_cost,
      assignment.supply_cost_per_uom,
      assignment.supply_cost,
      assignment.created_by || null,
      assignment.target_date || null // Include target_date
    ]);

    const query = `
      INSERT INTO supply_material_assign 
      (pd_id, site_id, item_id, uom_id, quantity, production_cost_per_uom, production_cost, supply_cost_per_uom, supply_cost, created_by, target_date) 
      VALUES ?
    `;

    const [result] = await db.query(query, [values]);

    res.status(200).json({
      status: 'success',
      message: 'Materials assigned successfully',
      data: { affectedRows: result.affectedRows }
    });
  } catch (error) {
    console.error('Error assigning materials:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to assign materials',
      error: error.message
    });
  }
};

exports.getAssignedMaterials = async (req, res) => {
  try {
    const { site_id } = req.query;
    if (!site_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id is required',
      });
    }

    const query = `
      SELECT sma.*, m.item_name, u.uom_name,
      (sma.quantity - COALESCE(SUM(smd.dispatch_qty), 0)) AS remaining_quantity
      FROM supply_material_assign sma
      LEFT JOIN material_master m ON sma.item_id = m.item_id
      LEFT JOIN uom_master u ON sma.uom_id = u.uom_id
      LEFT JOIN supply_material_dispatch smd ON sma.id = smd.supply_material_assign_id
      WHERE sma.site_id = ?
      GROUP BY sma.id
      HAVING remaining_quantity > 0
      ORDER BY sma.created_at DESC
    `;

    const [rows] = await db.query(query, [site_id]);

    res.status(200).json({
      status: 'success',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching assigned materials:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assigned materials',
      error: error.message,
    });
  }
};





// New functions for supply company

async function generateNewSupplyCompanyId() {
  try {
    const [rows] = await db.query('SELECT company_id FROM supply_company ORDER BY company_id DESC LIMIT 1');
    if (rows.length === 0) {
      return 'SUPP001';
    }
    const lastId = rows[0].company_id;
    const numPart = parseInt(lastId.replace('SUPP', '')) + 1;
    return 'SUPP' + numPart.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating company ID:', error);
    throw error;
  }
}

// exports.createSupplyCompany = async (req, res) => {
//   try {
//     const { company_name, address, gst_number, vendor_code, city_id, state_id, pincode, spoc_name, spoc_contact_no } = req.body;
    
//     if (!company_name || !address || !spoc_name || !spoc_contact_no) {
//       return res.status(400).json({ error: "Company name, address, SPOC name, and SPOC contact number are required" });
//     }

//     const company_id = await generateNewSupplyCompanyId();
    
//     const query = `
//       INSERT INTO supply_company 
//       (company_id, company_name, address, gst_number, vendor_code, city_id, state_id, pincode, spoc_name, spoc_contact_no, created_at, updated_at) 
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
//     `;
    
//     await db.query(query, [
//       company_id,
//       company_name,
//       address,
//       gst_number || null,
//       vendor_code || null,
//       city_id ? parseInt(city_id) : null,
//       state_id ? parseInt(state_id) : null,
//       pincode || null,
//       spoc_name,
//       spoc_contact_no
//     ]);

//     res.status(201).json({ message: "Supply company created successfully", company_id });
//   } catch (error) {
//     console.error("Error creating supply company:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };


exports.createSupplyCompany = async (req, res) => {
  try {
    const { company_name, address, gst_number, vendor_code, city_id, state_id, pincode, spoc_name, spoc_contact_no, created_by } = req.body;
    
    if (!company_name || !address || !spoc_name || !spoc_contact_no || !created_by) {
      return res.status(400).json({ error: "Company name, address, SPOC name, SPOC contact number, and created_by are required" });
    }

    // Validate created_by
    if (typeof created_by !== 'string' || created_by.trim() === '') {
      return res.status(400).json({
        error: "Created By is required and must be a non-empty string",
      });
    }

    // Verify if created_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        error: "Invalid Created By: User does not exist",
      });
    }

    const company_id = await generateNewSupplyCompanyId();
    
    const query = `
      INSERT INTO supply_company 
      (company_id, company_name, address, gst_number, vendor_code, city_id, state_id, pincode, spoc_name, spoc_contact_no, created_by, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    await db.query(query, [
      company_id,
      company_name,
      address,
      gst_number || null,
      vendor_code || null,
      city_id ? parseInt(city_id) : null,
      state_id ? parseInt(state_id) : null,
      pincode || null,
      spoc_name,
      spoc_contact_no,
      created_by
    ]);

    res.status(201).json({ message: "Supply company created successfully", company_id });
  } catch (error) {
    console.error("Error creating supply company:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Duplicate entry detected' });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllSupplyCompanies = async (req, res) => {
  try {
    const query = `
      SELECT sc.*, cm.city_name, sm.state_name
      FROM supply_company sc
      LEFT JOIN city cm ON sc.city_id = cm.id
      LEFT JOIN state sm ON sc.state_id = sm.id
      ORDER BY sc.created_at DESC
    `;
    const [companies] = await db.query(query);
    res.status(200).json(companies);
  } catch (error) {
    console.error("Error fetching supply companies:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSupplyCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    const query = `
      SELECT sc.*, cm.city_name, sm.state_name
      FROM supply_company sc
      LEFT JOIN city cm ON sc.city_id = cm.id
      LEFT JOIN state sm ON sc.state_id = sm.id
      WHERE sc.company_id = ?
    `;
    const [companies] = await db.query(query, [companyId]);
    if (companies.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json(companies[0]);
  } catch (error) {
    console.error("Error fetching supply company:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



exports.getStates = async (req, res) => {
  try {
    const query = 'SELECT id, state_name FROM state ORDER BY state_name ASC';
    const [states] = await db.query(query);
    res.status(200).json({ data: states });
  } catch (error) {
    console.error("Error fetching states:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getCities = async (req, res) => {
  try {
    const query = 'SELECT id, city_name FROM city ORDER BY city_name ASC';
    const [cities] = await db.query(query);
    res.status(200).json({ data: cities });
  } catch (error) {
    console.error("Error fetching cities:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createState = async (req, res) => {
  try {
    const { state_name } = req.body;
    if (!state_name) {
      return res.status(400).json({ error: "State name is required" });
    }
    const query = 'INSERT INTO state (state_name) VALUES (?)';
    const [result] = await db.query(query, [state_name]);
    res.status(201).json({ message: "State created successfully", id: result.insertId });
  } catch (error) {
    console.error("Error creating state:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createCity = async (req, res) => {
  try {
    const { city_name } = req.body;
    if (!city_name) {
      return res.status(400).json({ error: "City name is required" });
    }
    const query = 'INSERT INTO city (city_name) VALUES (?)';
    const [result] = await db.query(query, [city_name]);
    res.status(201).json({ message: "City created successfully", id: result.insertId });
  } catch (error) {
    console.error("Error creating city:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Functions for supply project and site management
async function generateNewSupplyProjectId() {
  try {
    const [rows] = await db.query('SELECT pd_id FROM supply_project_details ORDER BY pd_id DESC LIMIT 1');
    if (rows.length === 0) {
      return 'SPD001';
    }
    const lastId = rows[0].pd_id;
    const numPart = parseInt(lastId.replace('SPD', '')) + 1;
    return 'SPD' + numPart.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating project ID:', error);
    throw error;
  }
}

async function generateNewSupplySiteId() {
  try {
    const [rows] = await db.query('SELECT site_id FROM supply_site_details ORDER BY site_id DESC LIMIT 1');
    if (rows.length === 0) {
      return 'SSITE001';
    }
    const lastId = rows[0].site_id;
    const numPart = parseInt(lastId.replace('SSITE', '')) + 1;
    return 'SSITE' + numPart.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating site ID:', error);
    throw error;
  }
}

exports.createSupplyProject = async (req, res) => {
  try {
    const { company_id, project_name } = req.body;
    
    if (!company_id || !project_name) {
      return res.status(400).json({ error: "Company ID and project name are required" });
    }

    const pd_id = await generateNewSupplyProjectId();
    
    const query = `
      INSERT INTO supply_project_details 
      (pd_id, company_id, project_type_id, project_name) 
      VALUES (?, ?, 'PT002', ?)
    `;
    
    await db.query(query, [pd_id, company_id, project_name]);

    res.status(201).json({ message: "Supply project created successfully", pd_id });
  } catch (error) {
    console.error("Error creating supply project:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSupplyProjectsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const query = `
      SELECT * FROM supply_project_details 
      WHERE company_id = ?
      ORDER BY project_name ASC
    `;
    const [projects] = await db.query(query, [companyId]);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching supply projects:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createSupplySite = async (req, res) => {
  try {
    const { pd_id, site_name, po_number, location_id, new_location_name, supply_code, reckoner_type_id } = req.body;
    
    if (!pd_id || !site_name) {
      return res.status(400).json({ error: "Project ID and site name are required" });
    }

    let finalLocationId = location_id;
    if (new_location_name && !location_id) {
      finalLocationId = await generateNewLocationId();
      const createLocQuery = 'INSERT INTO location (location_id, location_name) VALUES (?, ?)';
      await db.query(createLocQuery, [finalLocationId, new_location_name]);
    }

    if (!finalLocationId) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    const site_id = await generateNewSupplySiteId();
    
    const query = `
      INSERT INTO supply_site_details 
      (site_id, site_name, po_number, pd_id, location_id, reckoner_type_id, supply_code) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [
      site_id,
      site_name,
      po_number || null,
      pd_id,
      finalLocationId,
      reckoner_type_id || null,
      supply_code || null
    ]);

    res.status(201).json({ message: "Supply site created successfully", site_id });
  } catch (error) {
    console.error("Error creating supply site:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSupplySitesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const query = `
      SELECT ssd.*, spd.project_name, l.location_name, rt.type_name
      FROM supply_site_details ssd
      LEFT JOIN supply_project_details spd ON ssd.pd_id = spd.pd_id
      LEFT JOIN location l ON ssd.location_id = l.location_id
      LEFT JOIN reckoner_types rt ON ssd.reckoner_type_id = rt.type_id
      WHERE spd.company_id = ?
      ORDER BY ssd.site_name ASC
    `;
    const [sites] = await db.query(query, [companyId]);
    res.status(200).json({ data: sites });
  } catch (error) {
    console.error("Error fetching supply sites:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Updated getLocations
exports.getLocations = async (req, res) => {
  try {
    const query = 'SELECT location_id, location_name FROM location ORDER BY location_name ASC';
    const [locations] = await db.query(query);
    res.status(200).json({ data: locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function generateNewLocationId() {
  try {
    const [rows] = await db.query('SELECT location_id FROM location ORDER BY location_id DESC LIMIT 1');
    if (rows.length === 0) {
      return 'LO001';
    }
    const lastId = rows[0].location_id;
    const numPart = parseInt(lastId.replace('LO', '')) + 1;
    return 'LO' + numPart.toString().padStart(3, '0');
  } catch (error) {
    console.error('Error generating location ID:', error);
    throw error;
  }
}
// Updated createLocation
exports.createLocation = async (req, res) => {
  try {
    const { location_name } = req.body;
    if (!location_name) {
      return res.status(400).json({ error: "Location name is required" });
    }
    const location_id = await generateNewLocationId();
    const query = 'INSERT INTO location (location_id, location_name) VALUES (?, ?)';
    await db.query(query, [location_id, location_name]);
    res.status(201).json({ message: "Location created successfully", location_id });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getReckonerTypes = async (req, res) => {
  try {
    const query = 'SELECT type_id, type_name FROM reckoner_types ORDER BY type_name ASC';
    const [types] = await db.query(query);
    res.status(200).json({ data: types });
  } catch (error) {
    console.error("Error fetching reckoner types:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// Add Supply Material Dispatch
exports.addSupplyMaterialDispatch = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { assignments, transport, created_by } = req.body;

    // Validate created_by
    if (!created_by || typeof created_by !== 'string' || created_by.trim() === '') {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Created By is required and must be a non-empty string',
      });
    }

    // Verify if created_by exists in the users table
    const [userExists] = await connection.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      await connection.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Created By: User does not exist',
      });
    }

    // Validate dispatch assignments
    let dispatchInsertedIds = [];
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      const validationErrors = [];
      const conflicts = [];

      for (const assignment of assignments) {
        const { material_assign_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty } = assignment;

        // Validation
        if (!material_assign_id || isNaN(material_assign_id)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: material_assign_id is required and must be a number`);
        }
        if (!dc_no || isNaN(dc_no)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dc_no is required and must be a number`);
        }
        if (!dispatch_date || !/^\d{4}-\d{2}-\d{2}$/.test(dispatch_date)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dispatch_date is required and must be in YYYY-MM-DD format`);
        }
        if (!order_no || typeof order_no !== 'string' || order_no.trim() === '') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: order_no is required and must be a non-empty string`);
        }
        if (!vendor_code || typeof vendor_code !== 'string' || vendor_code.trim() === '') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: vendor_code is required and must be a non-empty string`);
        }
        if (!dispatch_qty || isNaN(dispatch_qty) || dispatch_qty <= 0) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dispatch_qty is required and must be a positive number`);
        }

        // Check for conflicts (exceeding assigned quantity)
        if (!validationErrors.length) {
          const [maRow] = await connection.query('SELECT quantity, item_id, supply_cost_per_uom FROM supply_material_assign WHERE id = ?', [material_assign_id]);
          if (maRow.length === 0) {
            validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: Invalid material_assign_id, does not exist`);
            continue;
          }
          const { quantity, item_id, supply_cost_per_uom } = maRow[0];

          const [currentDispatched] = await connection.query(
            'SELECT COALESCE(SUM(dispatch_qty), 0) AS total_dispatched FROM supply_material_dispatch WHERE supply_material_assign_id = ?',
            [material_assign_id]
          );
          const total_dispatched = parseFloat(currentDispatched[0].total_dispatched);

          if (total_dispatched + parseFloat(dispatch_qty) > quantity) {
            const [itemRow] = await connection.query(
              'SELECT item_name FROM material_master WHERE item_id = ?',
              [item_id]
            );
            conflicts.push({
              material_assign_id,
              item_name: itemRow[0]?.item_name || 'Unknown',
            });
          }
        }
      }

      if (validationErrors.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Validation errors in dispatch assignments',
          errors: validationErrors,
        });
      }

      if (conflicts.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'already_dispatched',
          message: 'Some materials would exceed the assigned quantity if dispatched',
          conflicts,
        });
      }

      // Insert supply dispatch assignments
      for (const { material_assign_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty } of assignments) {
        const [maRow] = await connection.query('SELECT supply_cost_per_uom FROM supply_material_assign WHERE id = ?', [material_assign_id]);
        const supply_cost_per_uom = maRow[0].supply_cost_per_uom || 0;
        const dispatch_cost = parseFloat(dispatch_qty) * parseFloat(supply_cost_per_uom);

        const [result] = await connection.query(
          'INSERT INTO supply_material_dispatch (supply_material_assign_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty, dispatch_cost, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [material_assign_id, dc_no, dispatch_date, order_no, vendor_code, parseFloat(dispatch_qty), dispatch_cost, created_by]
        );
        dispatchInsertedIds.push({ material_assign_id, dispatch_id: result.insertId });
      }
    }

    // Validate and insert transport details
    let transportInsertedIds = [];
    if (dispatchInsertedIds.length > 0 && transport) {
      const { transport_type_id, provider_id, vehicle_id, driver_id, destination, booking_expense, travel_expense, provider_address, provider_mobile, vehicle_model, vehicle_number, driver_mobile, driver_address } = transport;

      // Validate transport fields
      const transportValidationErrors = [];
      if (!transport_type_id || isNaN(transport_type_id)) {
        transportValidationErrors.push('Transport: transport_type_id is required and must be a number');
      } else {
        const [typeExists] = await connection.query('SELECT id FROM transport_type WHERE id = ? AND id IN (1, 2)', [transport_type_id]);
        if (!typeExists.length) {
          transportValidationErrors.push('Transport: transport_type_id must be 1 (Own Vehicle) or 2 (Rental Vehicle)');
        }
      }
      if (!provider_id || (typeof provider_id === 'string' && provider_id.trim() === '')) {
        transportValidationErrors.push('Transport: provider_id is required and must be a non-empty string or number');
      }
      if (!vehicle_id || (typeof vehicle_id === 'string' && vehicle_id.trim() === '')) {
        transportValidationErrors.push('Transport: vehicle_id is required and must be a non-empty string or number');
      }
      if (!driver_id || (typeof driver_id === 'string' && driver_id.trim() === '')) {
        transportValidationErrors.push('Transport: driver_id is required and must be a non-empty string or number');
      }
      if (!destination || typeof destination !== 'string' || destination.trim() === '') {
        transportValidationErrors.push('Transport: destination is required and must be a non-empty string');
      }
      if (transport_type_id === '2' && (booking_expense === null || isNaN(booking_expense) || booking_expense < 0)) {
        transportValidationErrors.push('Transport: booking_expense is required for Rental Vehicle and must be a non-negative number');
      }
      if (booking_expense !== null && (isNaN(booking_expense) || booking_expense < 0)) {
        transportValidationErrors.push('Transport: booking_expense must be a non-negative number or null');
      }
      if (!travel_expense || isNaN(travel_expense) || travel_expense < 0) {
        transportValidationErrors.push('Transport: travel_expense is required and must be a non-negative number');
      }

      if (transportValidationErrors.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Validation errors in transport details',
          errors: transportValidationErrors,
        });
      }

      // Handle provider_id
      let resolvedProviderId = provider_id;
      if (typeof provider_id === 'string') {
        const [existingProvider] = await connection.query('SELECT id FROM provider_master WHERE provider_name = ?', [provider_id]);
        if (existingProvider.length > 0) {
          resolvedProviderId = existingProvider[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO provider_master (provider_name, address, mobile, transport_type_id) VALUES (?, ?, ?, ?)',
            [provider_id, provider_address || null, provider_mobile || null, transport_type_id]
          );
          resolvedProviderId = result.insertId;
        }
      } else {
        const [providerExists] = await connection.query('SELECT id FROM provider_master WHERE id = ?', [provider_id]);
        if (!providerExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid provider_id: Provider does not exist',
          });
        }
      }

      // Handle vehicle_id
      let resolvedVehicleId = vehicle_id;
      if (typeof vehicle_id === 'string') {
        const [existingVehicle] = await connection.query('SELECT id FROM vehicle_master WHERE vehicle_name = ? OR vehicle_number = ?', [vehicle_id, vehicle_id]);
        if (existingVehicle.length > 0) {
          resolvedVehicleId = existingVehicle[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO vehicle_master (vehicle_name, vehicle_model, vehicle_number) VALUES (?, ?, ?)',
            [vehicle_id, vehicle_model || null, vehicle_number || vehicle_id]
          );
          resolvedVehicleId = result.insertId;
        }
      } else {
        const [vehicleExists] = await connection.query('SELECT id FROM vehicle_master WHERE id = ?', [vehicle_id]);
        if (!vehicleExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid vehicle_id: Vehicle does not exist',
          });
        }
      }

      // Handle driver_id
      let resolvedDriverId = driver_id;
      if (typeof driver_id === 'string') {
        const [existingDriver] = await connection.query('SELECT id FROM driver_master WHERE driver_name = ?', [driver_id]);
        if (existingDriver.length > 0) {
          resolvedDriverId = existingDriver[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO driver_master (driver_name, driver_mobile, driver_address) VALUES (?, ?, ?)',
            [driver_id, driver_mobile || null, driver_address || null]
          );
          resolvedDriverId = result.insertId;
        }
      } else {
        const [driverExists] = await connection.query('SELECT id FROM driver_master WHERE id = ?', [driver_id]);
        if (!driverExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid driver_id: Driver does not exist',
          });
        }
      }

      // Insert supply transport details
      for (const { dispatch_id } of dispatchInsertedIds) {
        const [result] = await connection.query(
          'INSERT INTO supply_transport_master (supply_dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense, travel_expense, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [dispatch_id, resolvedProviderId, destination, resolvedVehicleId, resolvedDriverId, booking_expense || null, travel_expense]
        );
        transportInsertedIds.push(result.insertId);
      }
    }

    await connection.commit();
    res.status(201).json({
      status: 'success',
      message: 'Supply materials dispatched and transport details saved successfully',
      data: { dispatchInsertedIds, transportInsertedIds },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add supply dispatch error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reference: material_assign_id, provider_id, vehicle_id, or driver_id does not exist',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  } finally {
    connection.release();
  }
};

// Save Master DC No
exports.saveMasterDcNo = async (req, res) => {
  try {
    const { company_id, dc_no, created_by } = req.body;

    // Validate inputs
    if (!company_id || !dc_no || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'company_id, dc_no, and created_by are required',
      });
    }

    // Verify if created_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Created By: User does not exist',
      });
    }

    // Check if company_id exists in supply_company
    const [companyCheck] = await db.query('SELECT company_id FROM supply_company WHERE company_id = ?', [company_id]);
    if (companyCheck.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company_id: Company does not exist',
      });
    }

    // Check if master_dc_no already exists for the company
    const [existingDcNo] = await db.query('SELECT dc_no FROM supply_master_dc_no WHERE company_id = ?', [company_id]);
    if (existingDcNo.length > 0) {
      // Update existing master DC No
      await db.query(
        'UPDATE supply_master_dc_no SET dc_no = ?, created_by = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
        [dc_no, created_by, company_id]
      );
    } else {
      // Insert new master DC No
      await db.query(
        'INSERT INTO supply_master_dc_no (company_id, dc_no, created_by, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
        [company_id, dc_no, created_by]
      );
    }

    return res.status(200).json({
      status: 'success',
      message: 'Master DC No saved successfully',
    });
  } catch (error) {
    console.error('Error saving master DC No:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid company_id: Company does not exist in supply_company table',
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Failed to save Master DC No',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  }
};


exports.fetchSupplyMaterialAssignmentsWithDispatch = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { pd_id, site_id } = req.query;

    // Base query for supply dispatch
    let query = `
      SELECT 
        ma.id,
        ma.pd_id,
        ma.site_id,
        ma.item_id,
        ma.uom_id,
        ma.quantity,
        ma.comp_ratio_a,
        ma.comp_ratio_b,
        ma.comp_ratio_c,
        ma.desc_id,
        ma.created_at,
        mm.item_name,
        um.uom_name,
        wd.desc_name,
        pd.project_name,
        pd.company_id,
        cd.vendor_code,
        sd.site_name,
        sd.po_number,
        COALESCE(SUM(smd.dispatch_qty), 0) AS total_dispatched,
        (ma.quantity - COALESCE(SUM(smd.dispatch_qty), 0)) AS remaining_quantity,
        CASE 
          WHEN ma.quantity - COALESCE(SUM(smd.dispatch_qty), 0) > 0 THEN 'not-dispatched'
          ELSE 'dispatched'
        END AS dispatch_status
      FROM material_assign ma
      LEFT JOIN material_master mm ON ma.item_id = mm.item_id
      LEFT JOIN uom_master um ON ma.uom_id = um.uom_id
      LEFT JOIN work_descriptions wd ON ma.desc_id = wd.desc_id
      LEFT JOIN project_details pd ON ma.pd_id = pd.pd_id
      LEFT JOIN company cd ON pd.company_id = cd.company_id
      LEFT JOIN site_details sd ON ma.site_id = sd.site_id
      LEFT JOIN supply_material_dispatch smd ON ma.id = smd.supply_material_assign_id
      WHERE 1=1
    `;
    const queryParams = [];

    // Add filters based on provided parameters
    if (pd_id && site_id) {
      query += ' AND ma.pd_id = ? AND ma.site_id = ?';
      queryParams.push(pd_id, site_id);
    } else if (pd_id) {
      query += ' AND ma.pd_id = ?';
      queryParams.push(pd_id);
    } else if (site_id) {
      query += ' AND ma.site_id = ?';
      queryParams.push(site_id);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'At least one of pd_id or site_id is required',
      });
    }

    // Group by all non-aggregated columns and filter for non-dispatched materials
    query += `
      GROUP BY 
        ma.id,
        ma.pd_id,
        ma.site_id,
        ma.item_id,
        ma.uom_id,
        ma.quantity,
        ma.comp_ratio_a,
        ma.comp_ratio_b,
        ma.comp_ratio_c,
        ma.desc_id,
        ma.created_at,
        mm.item_name,
        um.uom_name,
        wd.desc_name,
        pd.project_name,
        pd.company_id,
        cd.vendor_code,
        sd.site_name,
        sd.po_number
      HAVING remaining_quantity > 0
      ORDER BY ma.id
    `;

    const [rows] = await connection.query(query, queryParams);

    // Ensure rows is an array
    const result = Array.isArray(rows) ? rows : [];

    res.status(200).json({
      status: 'success',
      message: 'Non-dispatched supply material assignments fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching supply material assignments with dispatch:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch supply material assignments',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  } finally {
    connection.release();
  }
};

exports.getNextSupplyDcNo = async function (req, res) {
  try {
    const { site_id } = req.query;

    if (!site_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id is required in query parameters',
      });
    }

    // Check if site has any assignments
    const [assignCheck] = await db.query(
      'SELECT COUNT(*) as count FROM supply_material_assign WHERE site_id = ?',
      [site_id]
    );

    if (assignCheck[0].count === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No prior assignments found; starting DC No from 1',
        data: { next_dc_no: 1, site_id }
      });
    }

    // Fetch the maximum dc_no for all supply dispatches linked to this site
    const [dispatchRows] = await db.query(
      `SELECT MAX(smd.dc_no) AS max_dc_no 
       FROM supply_material_dispatch smd 
       INNER JOIN supply_material_assign sma ON smd.supply_material_assign_id = sma.id 
       WHERE sma.site_id = ?`,
      [site_id]
    );

    const maxDcNo = parseInt(dispatchRows[0]?.max_dc_no) || 0;
    const nextDcNo = maxDcNo + 1;

    res.status(200).json({
      status: 'success',
      message: 'Next site-wise supply DC No fetched successfully',
      data: { next_dc_no: nextDcNo, site_id }
    });
  } catch (error) {
    console.error('Error fetching next supply DC No:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch next supply DC No due to server error',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  }
};


exports.getSupplyTransportTypes = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, type FROM transport_type");
    res.status(200).json({ status: "success", message: "Transport types fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching transport types:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch transport types", error: error.message });
  }
};

exports.getSupplyProviders = async function(req, res) {
  const { transport_type_id } = req.query;
  try {
    let query = "SELECT id, provider_name FROM provider_master";
    const queryParams = [];
    if (transport_type_id && !isNaN(transport_type_id)) {
      query += " WHERE transport_type_id = ?";
      queryParams.push(transport_type_id);
    }
    const [rows] = await db.query(query, queryParams);
    res.status(200).json({ status: "success", message: "Providers fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch providers", error: error.message });
  }
};

exports.getSupplyVehicles = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, vehicle_name, vehicle_model, vehicle_number FROM vehicle_master");
    res.status(200).json({ status: "success", message: "Vehicles fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch vehicles", error: error.message });
  }
};

exports.getSupplyDrivers = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, driver_name, driver_mobile, driver_address FROM driver_master");
    res.status(200).json({ status: "success", message: "Drivers fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch drivers", error: error.message });
  }
};


// Get Master DC No
exports.getMasterDcNo = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) {
      return res.status(400).json({ status: "error", message: "Company ID is required" });
    }

    const [rows] = await db.query(
      "SELECT dc_no FROM supply_master_dc_no WHERE company_id = ?",
      [company_id]
    );

    if (rows.length > 0) {
      return res.status(200).json({ status: "success", data: { dc_no: rows[0].dc_no } });
    } else {
      return res.status(200).json({ status: "success", data: null });
    }
  } catch (error) {
    console.error("Error fetching master DC No:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};










// Fetch supply dispatched materials
// exports.fetchSupplyMaterialDispatchDetails = async (req, res) => {
//   try {
//     const { site_id } = req.query;

//     if (!site_id) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'site_id is required',
//       });
//     }

//     // Query to fetch dispatched materials with related data
//     const [dispatches] = await db.query(
//       `
//       SELECT 
//         smd.id, smd.dc_no, smd.dispatch_date, smd.order_no, smd.vendor_code, 
//         smd.dispatch_qty, smd.dispatch_cost, smd.created_at,
//         sma.pd_id, sma.site_id, sma.item_id, sma.quantity AS assigned_quantity,
//         sma.supply_cost_per_uom, sma.supply_cost,
//         mm.item_name, um.uom_name,
//         stm.destination, stm.travel_expense, stm.booking_expense,
//         vm.vehicle_number, dm.driver_name, dm.driver_mobile
//       FROM supply_material_dispatch smd
//       INNER JOIN supply_material_assign sma ON smd.supply_material_assign_id = sma.id
//       INNER JOIN material_master mm ON sma.item_id = mm.item_id
//       INNER JOIN uom_master um ON sma.uom_id = um.uom_id
//       LEFT JOIN supply_transport_master stm ON smd.id = stm.supply_dispatch_id
//       LEFT JOIN vehicle_master vm ON stm.vehicle_id = vm.id
//       LEFT JOIN driver_master dm ON stm.driver_id = dm.id
//       WHERE sma.site_id = ?
//       ORDER BY smd.dispatch_date DESC
//       `,
//       [site_id]
//     );

//     // Group dispatches by dc_no and dispatch_date
//     const dispatchGroupsMap = dispatches.reduce((acc, dispatch) => {
//       const key = `${dispatch.dc_no}-${dispatch.dispatch_date}`;
//       if (!acc[key]) {
//         acc[key] = {
//           dc_no: dispatch.dc_no,
//           dispatch_date: dispatch.dispatch_date,
//           created_at: dispatch.created_at,
//           materials: [],
//         };
//       }
//       acc[key].materials.push({
//         id: dispatch.id,
//         dc_no: dispatch.dc_no,
//         dispatch_date: dispatch.dispatch_date,
//         order_no: dispatch.order_no,
//         vendor_code: dispatch.vendor_code,
//         dispatch_qty: dispatch.dispatch_qty,
//         dispatch_cost: dispatch.dispatch_cost,
//         created_at: dispatch.created_at,
//         item_name: dispatch.item_name,
//         assigned_quantity: dispatch.assigned_quantity,
//         supply_cost_per_uom: dispatch.supply_cost_per_uom,
//         supply_cost: dispatch.supply_cost,
//         uom_name: dispatch.uom_name,
//         transport_details: [
//           {
//             destination: dispatch.destination || null,
//             travel_expense: dispatch.travel_expense || null,
//             booking_expense: dispatch.booking_expense || null,
//             vehicle: dispatch.vehicle_number ? { vehicle_number: dispatch.vehicle_number } : null,
//             driver: dispatch.driver_name
//               ? { driver_name: dispatch.driver_name, driver_mobile: dispatch.driver_mobile }
//               : null,
//           },
//         ],
//       });
//       return acc;
//     }, {});

//     const groupedDispatches = Object.values(dispatchGroupsMap);

//     return res.status(200).json({
//       status: 'success',
//       data: groupedDispatches,
//     });
//   } catch (error) {
//     console.error('Error fetching supply dispatched materials:', error);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch dispatched materials',
//       error: error.message,
//       sqlMessage: error.sqlMessage || 'No SQL message available',
//     });
//   }
// };










































exports.fetchSupplyMaterialDispatchDetails = async (req, res) => {
  try {
    // Query to fetch ALL dispatched materials with related data (NO WHERE clause)
    const [dispatches] = await db.query(`
      SELECT 
        smd.id, smd.dc_no, smd.dispatch_date, smd.order_no, smd.vendor_code, 
        smd.dispatch_qty, smd.dispatch_cost, smd.created_at,
        sma.pd_id, sma.site_id, sma.item_id, sma.quantity AS assigned_quantity,
        sma.supply_cost_per_uom, sma.supply_cost,
        mm.item_name, um.uom_name,
        stm.destination, stm.travel_expense, stm.booking_expense,
        vm.vehicle_number, dm.driver_name, dm.driver_mobile
      FROM supply_material_dispatch smd
      INNER JOIN supply_material_assign sma ON smd.supply_material_assign_id = sma.id
      INNER JOIN material_master mm ON sma.item_id = mm.item_id
      INNER JOIN uom_master um ON sma.uom_id = um.uom_id
      LEFT JOIN supply_transport_master stm ON smd.id = stm.supply_dispatch_id
      LEFT JOIN vehicle_master vm ON stm.vehicle_id = vm.id
      LEFT JOIN driver_master dm ON stm.driver_id = dm.id
      ORDER BY smd.dispatch_date DESC
    `);

    // Group dispatches by dc_no and dispatch_date (EXACT SAME LOGIC)
    const dispatchGroupsMap = dispatches.reduce((acc, dispatch) => {
      const key = `${dispatch.dc_no}-${dispatch.dispatch_date}`;
      if (!acc[key]) {
        acc[key] = {
          dc_no: dispatch.dc_no,
          dispatch_date: dispatch.dispatch_date,
          created_at: dispatch.created_at,
          materials: [],
        };
      }
      acc[key].materials.push({
        id: dispatch.id,
        dc_no: dispatch.dc_no,
        dispatch_date: dispatch.dispatch_date,
        order_no: dispatch.order_no,
        vendor_code: dispatch.vendor_code,
        dispatch_qty: dispatch.dispatch_qty,
        dispatch_cost: dispatch.dispatch_cost,
        created_at: dispatch.created_at,
        item_name: dispatch.item_name,
        assigned_quantity: dispatch.assigned_quantity,
        supply_cost_per_uom: dispatch.supply_cost_per_uom,
        supply_cost: dispatch.supply_cost,
        uom_name: dispatch.uom_name,
        transport_details: [
          {
            destination: dispatch.destination || null,
            travel_expense: dispatch.travel_expense || null,
            booking_expense: dispatch.booking_expense || null,
            vehicle: dispatch.vehicle_number ? { vehicle_number: dispatch.vehicle_number } : null,
            driver: dispatch.driver_name
              ? { driver_name: dispatch.driver_name, driver_mobile: dispatch.driver_mobile }
              : null,
          },
        ],
      });
      return acc;
    }, {});

    const groupedDispatches = Object.values(dispatchGroupsMap);

    return res.status(200).json({
      status: 'success',
      data: groupedDispatches,
    });
  } catch (error) {
    console.error('Error fetching supply dispatched materials:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dispatched materials',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  }
};

