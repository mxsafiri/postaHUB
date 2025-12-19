ALTER TABLE accounts
  ADD COLUMN IF NOT EXISTS nida_verification_status TEXT NOT NULL DEFAULT 'not_provided',
  ADD COLUMN IF NOT EXISTS nida_verification_updated_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS nida_verified_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS nida_verification_failure_reason TEXT NULL;

ALTER TABLE accounts
  DROP CONSTRAINT IF EXISTS accounts_nida_verification_status_check;

ALTER TABLE accounts
  ADD CONSTRAINT accounts_nida_verification_status_check
  CHECK (nida_verification_status IN ('not_provided', 'pending', 'verified', 'failed'));

UPDATE accounts
SET
  nida_verification_status = CASE
    WHEN nida_number IS NULL THEN 'not_provided'
    ELSE 'pending'
  END,
  nida_verification_updated_at = CASE
    WHEN nida_number IS NULL THEN NULL
    ELSE COALESCE(nida_verification_updated_at, now())
  END
WHERE nida_verification_status IS NULL
   OR nida_verification_status NOT IN ('not_provided', 'pending', 'verified', 'failed');
