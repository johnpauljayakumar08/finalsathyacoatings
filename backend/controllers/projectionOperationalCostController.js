const jwt = require('jsonwebtoken');
const db = require('../config/db');

const normalizeRole = role => String(role || '').replace(/[\s_-]/g, '').toLowerCase();

const getAuthenticatedUser = req => {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
  } catch (error) {
    if (['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) {
      return null;
    }
    throw error;
  }
};

const readProjectionRequest = body => {
  const siteId = String(body.site_id || '').trim();
  const descId = Number(body.desc_id);
  const projectionId = Number(body.projection_id);
  if (!siteId || siteId.length > 30 ||
      !Number.isInteger(descId) || descId <= 0 ||
      !Number.isInteger(projectionId) || projectionId <= 0) {
    return null;
  }
  return { siteId, descId, projectionId };
};

const loadChangeContext = async (connection, { siteId, descId, projectionId }, requestedCost) => {
  const [budgetRows] = await connection.query(
    `SELECT id, projection_id, total_budget_value, total_po_value
     FROM po_budget
     WHERE site_id = ? AND desc_id = ?
     ORDER BY projection_id, id
     FOR UPDATE`,
    [siteId, descId]
  );
  const latestBudgets = new Map();
  budgetRows.forEach(row => latestBudgets.set(Number(row.projection_id), row));
  const targetBudget = latestBudgets.get(projectionId);
  if (!targetBudget) return { error: { status: 404, message: 'Projection budget was not found.' } };

  const [submittedRows] = await connection.query(
    'SELECT id FROM actual_budget WHERE po_budget_id = ? LIMIT 1 FOR UPDATE',
    [targetBudget.id]
  );
  if (submittedRows.length === 0) {
    return { error: { status: 400, message: 'Operational Cost change requests are available only after projection submission.' } };
  }

  const currentCost = Number(targetBudget.total_budget_value) || 0;
  const poValue = Number(targetBudget.total_po_value) || 0;
  if (!Number.isFinite(requestedCost) || requestedCost <= 0 || requestedCost > poValue + 0.009) {
    return { error: { status: 400, message: `Operational Cost must be greater than zero and cannot exceed the PO Value of ₹${poValue.toFixed(2)}.` } };
  }
  if (Math.abs(requestedCost - currentCost) < 0.005) {
    return { error: { status: 400, message: 'The requested Operational Cost is unchanged.' } };
  }

  const budgetIds = [...latestBudgets.values()].map(row => Number(row.projection_id));
  const [allocationRows] = budgetIds.length
    ? await connection.query(
      `SELECT pa.id, pa.projection_id, pa.overhead_type_id, pa.total_cost
       FROM projection_allocated pa
       JOIN (
         SELECT projection_id, overhead_type_id, MAX(id) AS id
         FROM projection_allocated
         WHERE site_id = ? AND desc_id = ? AND projection_id IN (?)
         GROUP BY projection_id, overhead_type_id
       ) latest ON latest.id = pa.id`,
      [siteId, descId, budgetIds]
    )
    : [[]];
  const allocationsByProjection = new Map();
  allocationRows.forEach(row => {
    const id = Number(row.projection_id);
    allocationsByProjection.set(
      id,
      (allocationsByProjection.get(id) || 0) + (Number(row.total_cost) || 0)
    );
  });

  const [spentRows] = await connection.query(
    `SELECT COALESCE(SUM(GREATEST(COALESCE(ab.actual_value, 0), COALESCE(history.spent, 0))), 0) AS total_spent
     FROM actual_budget ab
     LEFT JOIN (
       SELECT actual_budget_id, SUM(actual_value) AS spent
       FROM actual_budget_history
       GROUP BY actual_budget_id
     ) history ON history.actual_budget_id = ab.id
     WHERE ab.po_budget_id = ?`,
    [targetBudget.id]
  );
  const actualSpent = Number(spentRows[0]?.total_spent) || 0;

  const orderedBudgets = [...latestBudgets.values()]
    .sort((left, right) => Number(left.projection_id) - Number(right.projection_id));
  const balances = [];
  let carriedRemaining = 0;
  for (const budget of orderedBudgets) {
    const id = Number(budget.projection_id);
    const baseCost = id === projectionId
      ? requestedCost
      : Number(budget.total_budget_value) || 0;
    const effectiveBudget = baseCost + carriedRemaining;
    const allocated = allocationsByProjection.get(id) || 0;
    const remaining = Number((effectiveBudget - allocated).toFixed(2));
    if (id >= projectionId && remaining < -0.009) {
      return {
        error: {
          status: 400,
          message: `Operational Cost cannot be reduced to this amount because Projection ${id} would have a negative remaining budget.`
        }
      };
    }
    if (id === projectionId && effectiveBudget < actualSpent - 0.009) {
      return {
        error: {
          status: 400,
          message: `Operational Cost cannot be reduced below the amount already spent (₹${actualSpent.toFixed(2)}).`
        }
      };
    }
    if (id >= projectionId) {
      balances.push({
        projection_id: id,
        effective_budget: effectiveBudget,
        remaining_budget: remaining,
        remaining_percentage: effectiveBudget > 0 ? (remaining / effectiveBudget) * 100 : 0,
      });
    }
    carriedRemaining = remaining;
  }

  return {
    targetBudget,
    currentCost,
    requestedCost,
    poValue,
    actualSpent,
    balances,
    allocations: allocationRows,
  };
};

exports.listOperationalCostChangeRequests = async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user?.user_id) {
    return res.status(401).json({ success: false, message: 'Sign in to view Operational Cost requests.' });
  }
  const projection = readProjectionRequest(req.query);
  if (!projection) {
    return res.status(400).json({ success: false, message: 'Valid site, description, and projection are required.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT request.id, request.site_id, request.desc_id, request.projection_id,
              request.previous_operational_cost, request.requested_operational_cost,
              request.remark, request.status, request.review_remark,
              request.requested_by, requester.user_name AS requested_by_name,
              request.reviewed_by, reviewer.user_name AS reviewed_by_name,
              request.created_at, request.reviewed_at
       FROM projection_operational_cost_change_requests request
       LEFT JOIN users requester ON requester.user_id = request.requested_by
       LEFT JOIN users reviewer ON reviewer.user_id = request.reviewed_by
       WHERE request.site_id = ? AND request.desc_id = ? AND request.projection_id = ?
         AND (? = 1 OR request.requested_by = ?)
       ORDER BY request.id DESC`,
      [
        projection.siteId,
        projection.descId,
        projection.projectionId,
        ['md', 'managingdirector'].includes(normalizeRole(user.role)) ? 1 : 0,
        user.user_id,
      ]
    );
    return res.status(200).json({
      success: true,
      can_review: ['md', 'managingdirector'].includes(normalizeRole(user.role)),
      data: rows,
    });
  } catch (error) {
    console.error('Error loading Operational Cost change requests:', error);
    return res.status(500).json({ success: false, message: 'Failed to load Operational Cost change requests.' });
  }
};

exports.createOperationalCostChangeRequest = async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user?.user_id) {
    return res.status(401).json({ success: false, message: 'Sign in before raising an Operational Cost request.' });
  }
  const projection = readProjectionRequest(req.body);
  const requestedCost = Number(req.body.requested_operational_cost);
  const remark = typeof req.body.remark === 'string' ? req.body.remark.trim() : '';
  if (!projection || !Number.isFinite(requestedCost) || !remark || remark.length > 2000) {
    return res.status(400).json({ success: false, message: 'Enter a valid Operational Cost and a remark (up to 2000 characters).' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const context = await loadChangeContext(connection, projection, requestedCost);
    if (context.error) {
      await connection.rollback();
      return res.status(context.error.status).json({ success: false, message: context.error.message });
    }

    const [pendingRows] = await connection.query(
      `SELECT id FROM projection_operational_cost_change_requests
       WHERE site_id = ? AND desc_id = ? AND projection_id = ? AND status = 'pending'
       LIMIT 1 FOR UPDATE`,
      [projection.siteId, projection.descId, projection.projectionId]
    );
    if (pendingRows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'A pending Operational Cost request already exists for this projection.' });
    }

    const [insertResult] = await connection.query(
      `INSERT INTO projection_operational_cost_change_requests
       (site_id, desc_id, projection_id, po_budget_id, previous_operational_cost,
        requested_operational_cost, remark, requested_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        projection.siteId,
        projection.descId,
        projection.projectionId,
        context.targetBudget.id,
        context.currentCost,
        context.requestedCost,
        remark,
        user.user_id,
      ]
    );
    await connection.commit();
    return res.status(201).json({
      success: true,
      message: 'Operational Cost change request submitted for Managing Director review.',
      data: { id: insertResult.insertId },
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(rollbackError => console.error('Request rollback failed:', rollbackError));
    console.error('Error creating Operational Cost change request:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit the Operational Cost change request.' });
  } finally {
    if (connection) connection.release();
  }
};

exports.reviewOperationalCostChangeRequest = async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user?.user_id) {
    return res.status(401).json({ success: false, message: 'A Managing Director login is required.' });
  }
  if (!['md', 'managingdirector'].includes(normalizeRole(user.role))) {
    return res.status(403).json({ success: false, message: 'Only a Managing Director can review this request.' });
  }

  const requestId = Number(req.params.requestId);
  const decision = String(req.body.decision || '').toLowerCase();
  const reviewRemark = typeof req.body.review_remark === 'string' ? req.body.review_remark.trim() : '';
  if (!Number.isInteger(requestId) || requestId <= 0 ||
      !['approved', 'rejected'].includes(decision) || reviewRemark.length > 1000) {
    return res.status(400).json({ success: false, message: 'A valid request, decision, and optional review remark are required.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    const [initialRequestRows] = await connection.query(
      `SELECT id, site_id, desc_id, projection_id, po_budget_id,
              previous_operational_cost, requested_operational_cost, status
       FROM projection_operational_cost_change_requests
       WHERE id = ?`,
      [requestId]
    );
    if (initialRequestRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Operational Cost request was not found.' });
    }
    const changeRequest = initialRequestRows[0];
    if (changeRequest.status !== 'pending') {
      await connection.rollback();
      return res.status(409).json({ success: false, message: 'This Operational Cost request has already been reviewed.' });
    }

    if (decision === 'approved') {
      const projection = {
        siteId: changeRequest.site_id,
        descId: Number(changeRequest.desc_id),
        projectionId: Number(changeRequest.projection_id),
      };
      const context = await loadChangeContext(
        connection,
        projection,
        Number(changeRequest.requested_operational_cost)
      );
      if (context.error) {
        await connection.rollback();
        return res.status(context.error.status).json({ success: false, message: context.error.message });
      }
      const [lockedRequestRows] = await connection.query(
        `SELECT id, status FROM projection_operational_cost_change_requests
         WHERE id = ? FOR UPDATE`,
        [requestId]
      );
      if (lockedRequestRows.length === 0 || lockedRequestRows[0].status !== 'pending') {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'This Operational Cost request has already been reviewed.' });
      }
      if (Number(context.targetBudget.id) !== Number(changeRequest.po_budget_id) ||
          Math.abs(context.currentCost - Number(changeRequest.previous_operational_cost)) >= 0.005) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'The Operational Cost changed after this request was raised. Refresh and submit a new request.' });
      }

      await connection.query(
        'UPDATE po_budget SET total_budget_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [context.requestedCost, context.targetBudget.id]
      );
      for (const allocation of context.allocations) {
        const effectiveBudget = context.balances.find(
          row => Number(row.projection_id) === Number(allocation.projection_id)
        )?.effective_budget;
        if (effectiveBudget === undefined) continue;
        const percentage = effectiveBudget > 0
          ? (Number(allocation.total_cost || 0) / effectiveBudget) * 100
          : 0;
        await connection.query(
          'UPDATE projection_allocated SET budget_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [percentage, allocation.id]
        );
      }

      const projectionIds = context.balances.map(row => row.projection_id);
      if (projectionIds.length > 0) {
        const [remainingRows] = await connection.query(
          `SELECT id, projection_id
           FROM projection_remaining
           WHERE site_id = ? AND desc_id = ? AND projection_id IN (?)
           ORDER BY projection_id, created_at DESC, id DESC
           FOR UPDATE`,
          [projection.siteId, projection.descId, projectionIds]
        );
        const latestRemainingByProjection = new Map();
        remainingRows.forEach(row => {
          const id = Number(row.projection_id);
          if (!latestRemainingByProjection.has(id)) latestRemainingByProjection.set(id, Number(row.id));
        });
        for (const balance of context.balances) {
          const remainingId = latestRemainingByProjection.get(Number(balance.projection_id));
          if (remainingId) {
            await connection.query(
              `UPDATE projection_remaining
               SET remaining_budget = ?, remaining_percentage = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`,
              [balance.remaining_budget, balance.remaining_percentage, remainingId]
            );
          } else {
            await connection.query(
              `INSERT INTO projection_remaining
               (site_id, desc_id, remaining_budget, remaining_percentage, projection_id, created_by)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                projection.siteId,
                projection.descId,
                balance.remaining_budget,
                balance.remaining_percentage,
                balance.projection_id,
                user.user_id,
              ]
            );
          }
        }
      }
    } else {
      const [lockedRequestRows] = await connection.query(
        `SELECT id, status FROM projection_operational_cost_change_requests
         WHERE id = ? FOR UPDATE`,
        [requestId]
      );
      if (lockedRequestRows.length === 0 || lockedRequestRows[0].status !== 'pending') {
        await connection.rollback();
        return res.status(409).json({ success: false, message: 'This Operational Cost request has already been reviewed.' });
      }
    }

    await connection.query(
      `UPDATE projection_operational_cost_change_requests
       SET status = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, review_remark = ?
       WHERE id = ?`,
      [decision, user.user_id, reviewRemark || null, requestId]
    );
    await connection.commit();
    return res.status(200).json({
      success: true,
      message: decision === 'approved'
        ? 'Operational Cost request approved and applied.'
        : 'Operational Cost request rejected.',
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(rollbackError => console.error('Review rollback failed:', rollbackError));
    console.error('Error reviewing Operational Cost change request:', error);
    return res.status(500).json({ success: false, message: 'Failed to review the Operational Cost change request.' });
  } finally {
    if (connection) connection.release();
  }
};
