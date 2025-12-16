INSERT INTO roles (key, name)
VALUES
  ('citizen', 'Citizen / Youth'),
  ('institution_admin', 'Institution / Program Admin'),
  ('verifier_agent', 'Verifier / Agent'),
  ('platform_admin', 'Platform Admin')
ON CONFLICT (key) DO NOTHING;
