-- Run this in PostgreSQL database: lmsdb
-- It seeds minimum master data needed by frontend registration/login flows.

-- 1) Role master seed
INSERT INTO fnd_role_master (
  created_by,
  creation_date_time,
  updated_by,
  updation_date_time,
  role_master_code,
  role_master_name
)
VALUES
  (NULL, NOW(), NULL, NOW(), 'STUDENT_MASTER_ROLE_1', 'STUDENT'),
  (NULL, NOW(), NULL, NOW(), 'TEACHER_MASTER_ROLE_1', 'TEACHER'),
  (NULL, NOW(), NULL, NOW(), 'ADMIN_MASTER_ROLE_1', 'ADMIN'),
  (NULL, NOW(), NULL, NOW(), 'SUPER_ADMIN_MASTER_ROLE_1', 'SUPER_ADMIN')
ON CONFLICT (role_master_code) DO NOTHING;

-- 2) Organization master seed
INSERT INTO fnd_organization_master (
  created_by,
  creation_date_time,
  updated_by,
  updation_date_time,
  contact,
  is_active,
  organization_code,
  organization_image,
  organization_name
)
VALUES (
  NULL,
  NOW(),
  NULL,
  NOW(),
  '9999999999',
  TRUE,
  'SOUL01',
  NULL,
  'SOUL LIMITED'
)
ON CONFLICT (organization_code) DO NOTHING;

-- 3) Organization group / branch seed
INSERT INTO fnd_organization_groups (
  created_by,
  creation_date_time,
  updated_by,
  updation_date_time,
  is_active,
  org_address,
  org_city,
  org_code,
  org_contact_no,
  org_country,
  org_currency,
  org_latitude,
  org_longitude,
  org_name,
  org_pincode,
  org_state,
  organization_id
)
SELECT
  NULL,
  NOW(),
  NULL,
  NOW(),
  TRUE,
  'Infocity',
  'Bhubaneswar',
  'SOULBBSR_01',
  '9999999999',
  'India',
  'INR',
  0,
  0,
  'SOUL BBSR',
  '751024',
  'Odisha',
  om.organization_id
FROM fnd_organization_master om
WHERE om.organization_code = 'SOUL01'
  AND NOT EXISTS (
    SELECT 1
    FROM fnd_organization_groups og
    WHERE og.org_code = 'SOULBBSR_01'
  );

