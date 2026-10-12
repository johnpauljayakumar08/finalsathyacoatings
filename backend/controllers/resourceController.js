// supplyController.js
const db = require('../config/db');


exports.test = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'resource management Test API is working',
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





exports.getAllConsumables = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        consumable_name AS name,
        is_multi_use,
        created_at AS createdAt
      FROM resource_consumables
      ORDER BY created_at DESC
    `);

    const data = rows.map(row => ({
      id: row.id,
      name: row.name,
      isMultiUse: row.is_multi_use === 1,
      consumableStatus: row.is_multi_use === 1 ? 'multi use' : 'single use',
      createdAt: row.createdAt
    }));

    res.status(200).json({
      status: 'success',
      message: 'Consumables retrieved successfully',
      count: data.length,
      data
    });
  } catch (error) {
    console.error('Error fetching consumables:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to load consumables',
      error: error.message
    });
  }
};


// controllers/resourceController.js (or supplyController.js)
exports.createConsumable = async (req, res) => {
  try {
    const { consumable_name, is_multi_use } = req.body;

    if (!consumable_name || typeof consumable_name !== 'string' || consumable_name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Valid consumable_name is required'
      });
    }

    let multiUse = 0;
    if (is_multi_use === true || is_multi_use === 1 || is_multi_use === 'true' || String(is_multi_use).toLowerCase() === 'yes') {
      multiUse = 1;
    }

    const [result] = await db.query(
      `INSERT INTO resource_consumables 
       (consumable_name, is_multi_use, created_at) 
       VALUES (?, ?, NOW())`,
      [consumable_name.trim(), multiUse]
    );

    const insertId = result.insertId;

    const [rows] = await db.query(
      `SELECT 
         id,
         consumable_name AS name,
         is_multi_use,
         created_at AS createdAt
       FROM resource_consumables 
       WHERE id = ?`,
      [insertId]
    );

    const item = rows[0] || {};

    const responseItem = {
      id: item.id,
      name: item.name,
      isMultiUse: item.is_multi_use === 1,
      consumableStatus: item.is_multi_use === 1 ? 'multi use' : 'single use',
      createdAt: item.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'Consumable created successfully',
      data: responseItem
    });
  } catch (error) {
    console.error('Error creating consumable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create consumable',
      error: error.message
    });
  }
};

// POST /resource/dispatches  ── UPDATED ──
exports.createDispatch = async (req, res) => {
  try {
    const {
      resource_consumable_id,
      quantity,
      dispatch_date,
      current_site,
      destination_site,
      transport_amount = 0,

      // ── NEW FIELDS ──
      current_incharge_name,
      current_incharge_mobile,
      from_address,
      destination_incharge_name,
      destination_incharge_mobile,
      to_address,

      // Optional legacy fields
      vehicle_name_model,
      vehicle_number,
      driver_name,
      driver_mobile,
    } = req.body;

    // Required fields validation
    if (!resource_consumable_id || !quantity || !dispatch_date || !current_site || !destination_site) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: resource_consumable_id, quantity, dispatch_date, current_site, destination_site'
      });
    }

    const [result] = await db.query(
      `INSERT INTO resource_dispatches (
        resource_consumable_id, 
        quantity, 
        dispatch_date,
        current_site,
        destination_site,
        transport_amount,

        -- New columns
        current_incharge_name,
        current_incharge_mobile,
        from_address,
        destination_incharge_name,
        destination_incharge_mobile,
        to_address,

        -- Legacy optional fields
        vehicle_name_model,
        vehicle_number,
        driver_name,
        driver_mobile,

        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        resource_consumable_id,
        quantity.trim(),
        dispatch_date,
        current_site.trim(),
        destination_site.trim(),
        parseFloat(transport_amount) || 0,

        // New fields (allow null/empty)
        current_incharge_name?.trim() || null,
        current_incharge_mobile?.trim() || null,
        from_address?.trim() || null,
        destination_incharge_name?.trim() || null,
        destination_incharge_mobile?.trim() || null,
        to_address?.trim() || null,

        // Legacy
        vehicle_name_model?.trim() || null,
        vehicle_number?.trim() || null,
        driver_name?.trim() || null,
        driver_mobile?.trim() || null,
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Dispatch recorded successfully',
      data: { id: result.insertId }
    });
  } catch (err) {
    console.error('Error creating dispatch:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to save dispatch',
      error: err.message
    });
  }
};

// GET /resource/dispatches  ── UPDATED ──
exports.getDispatches = async (req, res) => {
  try {
    const { consumable_id } = req.query;

    let query = `
      SELECT 
        d.id,
        d.resource_consumable_id,
        d.quantity,
        d.dispatch_date,
        d.current_site,
        d.destination_site,
        d.transport_amount,
        
        -- New fields
        d.current_incharge_name,
        d.current_incharge_mobile,
        d.from_address,
        d.destination_incharge_name,
        d.destination_incharge_mobile,
        d.to_address,

        -- Legacy vehicle/driver fields
        d.vehicle_name_model,
        d.vehicle_number,
        d.driver_name,
        d.driver_mobile,

        d.created_at,
        d.updated_at,
        
        -- Consumable info
        c.consumable_name,
        CASE 
          WHEN c.is_multi_use = 1 THEN 'multi use'
          ELSE 'single use'
        END AS usage_type
      FROM resource_dispatches d
      LEFT JOIN resource_consumables c 
        ON d.resource_consumable_id = c.id
    `;

    const params = [];

    if (consumable_id) {
      query += ` WHERE d.resource_consumable_id = ?`;
      params.push(parseInt(consumable_id, 10));
    }

    query += ` ORDER BY d.dispatch_date DESC, d.created_at DESC`;

    const [rows] = await db.query(query, params);

    res.status(200).json({
      status: 'success',
      message: 'Dispatches retrieved successfully',
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching dispatches:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dispatch records',
      error: error.message
    });
  }
};