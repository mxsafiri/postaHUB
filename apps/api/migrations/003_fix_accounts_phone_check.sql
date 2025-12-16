ALTER TABLE accounts
  DROP CONSTRAINT IF EXISTS accounts_phone_e164_check;

ALTER TABLE accounts
  ADD CONSTRAINT accounts_phone_e164_check
  CHECK (phone_e164 ~ '^\+[1-9]\d{1,14}$');
