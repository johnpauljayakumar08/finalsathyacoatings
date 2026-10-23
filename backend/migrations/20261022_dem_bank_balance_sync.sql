UPDATE finance_bank_master
SET available_balance = opening_balance
WHERE COALESCE(available_balance, 0) = 0
  AND COALESCE(opening_balance, 0) <> 0;