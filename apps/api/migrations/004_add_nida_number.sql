ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS nida_number TEXT NULL;

ALTER TABLE accounts
  DROP CONSTRAINT IF EXISTS accounts_nida_number_check;

ALTER TABLE accounts
  ADD CONSTRAINT accounts_nida_number_check
  CHECK (nida_number IS NULL OR nida_number ~ '^\d{20}$');

CREATE UNIQUE INDEX IF NOT EXISTS accounts_nida_number_unique_idx
  ON accounts (nida_number)
  WHERE nida_number IS NOT NULL;
