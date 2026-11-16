const requiredRemarkRoutes = new Map([
  ['POST /site-incharge/completion-status', ['remarks']],
  ['PUT /site-incharge/update-completion-entry', ['remarks']],
  ['POST /site-incharge/acknowledge-material', ['remarks']],
  ['PUT /site-incharge/update-acknowledgement', ['remarks']],
  ['PUT /site-incharge/admin-update-acknowledgement', ['remarks']],
  ['POST /site-incharge/save-material-usage', ['remarks']],
  ['PUT /site-incharge/update-material-usage-entry', ['remarks']],
  ['PUT /site-incharge/admin-update-material-usage-entry', ['remarks']],
  ['POST /site-incharge/save-budget-expense', ['remarks']],
  ['PUT /site-incharge/update-budget-expense-entry', ['remarks']],
  ['PUT /site-incharge/admin-update-budget-expense-entry', ['remarks']],
  ['POST /site-incharge/save-labour-attendance', ['attendance_data']],
  ['POST /site-incharge/admin-save-labour-attendance', ['attendance_data']],
  ['POST /material/add-dispatch', ['assignments']],
  ['POST /finance/create-creditors', ['remarks']],
  ['PUT /finance/update-creditors', ['remarks']],
  ['POST /finance/siteincharge-attendance', ['attendances']],
  ['POST /finance/create-custom-payment', ['remarks']],
  ['PUT /finance/update-custom-payment/:id', ['remarks']],
  ['POST /finance/create-bill-to-be-raise', ['remarks']],
  ['PUT /finance/update-bill-to-be-raise/:id', ['remarks']],
  ['POST /projection/save-actual-budget', ['entries']],
  ['POST /projection/operational-cost-requests', ['remark']],
  ['PUT /projection/operational-cost-requests/:id/review', ['review_remark']],
  ['PUT /finance/update-bank-master', ['remarks']],
]);

const isNonEmptyString = value => typeof value === 'string' && value.trim().length > 0;

const validateProvidedRemarks = (value, path = 'body') => {
  if (!value || typeof value !== 'object') return null;

  for (const [key, nestedValue] of Object.entries(value)) {
    if (/^(remarks?|notes?|review_remarks?)$/i.test(key) && !isNonEmptyString(nestedValue)) {
      return `${path}.${key} is required and must be a non-empty string`;
    }

    const componentRemark = key.match(/^comp_([a-z])_remarks$/i);
    if (componentRemark) {
      const quantity = value[`comp_${componentRemark[1].toLowerCase()}_qty`];
      if (quantity !== null && quantity !== undefined && quantity !== '' && !isNonEmptyString(nestedValue)) {
        return `${path}.${key} is required when the component quantity is entered`;
      }
    }

    if (nestedValue && typeof nestedValue === 'object') {
      const error = validateProvidedRemarks(nestedValue, `${path}.${key}`);
      if (error) return error;
    }
  }
  return null;
};

const requireWriteRemarks = (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();

  const path = req.path.replace(/\/+$/, '') || '/';
  const normalizedPath = path.replace(/\/\d+(?=\/|$)/g, '/:id');
  const routeFields = requiredRemarkRoutes.get(`${req.method} ${normalizedPath}`) ||
    requiredRemarkRoutes.get(`${req.method} ${path}`);
  if (routeFields) {
    for (const field of routeFields) {
      if (field === 'attendance_data' || field === 'attendances' || field === 'assignments' || field === 'entries') {
        const entries = req.body?.[field];
        if (Array.isArray(entries)) {
          for (let index = 0; index < entries.length; index += 1) {
            const entry = entries[index];
            const remarks = entry?.remarks;
            if (field === 'assignments') {
              const hasComponentQuantity = ['a', 'b', 'c'].some(letter => {
                const quantity = entry?.[`comp_${letter}_qty`];
                return quantity !== null && quantity !== undefined && quantity !== '';
              });
              if (!hasComponentQuantity) continue;
              if (['a', 'b', 'c'].some(letter => {
                const quantity = entry?.[`comp_${letter}_qty`];
                return quantity !== null && quantity !== undefined && quantity !== '' &&
                  !isNonEmptyString(entry?.[`comp_${letter}_remarks`]);
              })) {
                return res.status(400).json({
                  status: 'error',
                  message: `Each dispatched component requires a non-empty remark (assignment ${index + 1})`,
                });
              }
              continue;
            }
            if (!isNonEmptyString(remarks)) {
              return res.status(400).json({
                status: 'error',
                message: `${field}[${index}].remarks is required and must be a non-empty string`,
              });
            }
          }
        } else if (field !== 'assignments') {
          return res.status(400).json({
            status: 'error',
            message: `${field} must be a non-empty array of entries with remarks`,
          });
        }
      } else if (!isNonEmptyString(req.body?.[field])) {
        return res.status(400).json({
          status: 'error',
          message: `${field} is required and must be a non-empty string`,
        });
      }
    }
  }

  const providedRemarkError = validateProvidedRemarks(req.body);
  if (providedRemarkError) {
    return res.status(400).json({ status: 'error', message: providedRemarkError });
  }
  return next();
};

module.exports = requireWriteRemarks;
module.exports.validateProvidedRemarks = validateProvidedRemarks;
