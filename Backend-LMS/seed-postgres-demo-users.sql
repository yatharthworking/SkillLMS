-- Run this in PostgreSQL database: lmsdb
-- It seeds minimum master data plus demo users for local login.
-- Shared password for all users: Pass@123
-- BCrypt hash for Pass@123: $2a$10$HDCFEiHKf0VKySuIe/OdBOrrwM86OZ6ipDWXbC7SMOgtHBGFgVuUm

-- 1) Role master seed
INSERT INTO fnd_role_master (
  role_master_id,
  created_by,
  creation_date_time,
  updated_by,
  updation_date_time,
  role_master_code,
  role_master_name
)
VALUES
  (nextval('seq_role_master'), NULL, NOW(), NULL, NOW(), 'STUDENT_MASTER_ROLE_1', 'STUDENT'),
  (nextval('seq_role_master'), NULL, NOW(), NULL, NOW(), 'TEACHER_MASTER_ROLE_1', 'TEACHER'),
  (nextval('seq_role_master'), NULL, NOW(), NULL, NOW(), 'ADMIN_MASTER_ROLE_1', 'ADMIN'),
  (nextval('seq_role_master'), NULL, NOW(), NULL, NOW(), 'SUPER_ADMIN_MASTER_ROLE_1', 'SUPER_ADMIN')
ON CONFLICT (role_master_code) DO NOTHING;

-- 2) Organization master seed
INSERT INTO fnd_organization_master (
  organization_id,
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
  nextval('seq_organization_master'),
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

-- 3) Branch seed
INSERT INTO fnd_organization_groups (
  org_id,
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
  nextval('seq_organization_groups'),
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

-- 4) Student user
DO $$
DECLARE
  branch_id BIGINT;
  role_master_id_value BIGINT;
  new_user_id BIGINT;
  new_roles_id BIGINT;
BEGIN
  SELECT org_id INTO branch_id
  FROM fnd_organization_groups
  WHERE org_code = 'SOULBBSR_01'
  LIMIT 1;

  SELECT role_master_id INTO role_master_id_value
  FROM fnd_role_master
  WHERE role_master_name = 'STUDENT'
  LIMIT 1;

  IF branch_id IS NULL THEN
    RAISE EXCEPTION 'Branch SOULBBSR_01 not found';
  END IF;

  IF role_master_id_value IS NULL THEN
    RAISE EXCEPTION 'Role STUDENT not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_info WHERE email = 'student@gmail.com') THEN
    INSERT INTO user_info (
      user_details_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      dob,
      email,
      full_name,
      gender,
      is_active,
      is_email_verified,
      is_mobile_verified,
      mobile_no,
      branch_id,
      provider,
      user_image,
      user_signature
    ) VALUES (
      nextval('user_details'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      NULL,
      'student@gmail.com',
      'Student User',
      'Male',
      TRUE,
      TRUE,
      FALSE,
      9000000001,
      branch_id,
      'LOCAL',
      NULL,
      NULL
    ) RETURNING user_details_id INTO new_user_id;

    INSERT INTO user_credentials_db (
      user_credential_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      user_name,
      user_password,
      user_details_id
    ) VALUES (
      nextval('user_credential'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      'student@gmail.com',
      '$2a$10$HDCFEiHKf0VKySuIe/OdBOrrwM86OZ6ipDWXbC7SMOgtHBGFgVuUm',
      new_user_id
    );

    INSERT INTO roles_db (
      roles_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      role
    ) VALUES (
      nextval('user_roles'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      role_master_id_value
    ) RETURNING roles_id INTO new_roles_id;

    INSERT INTO user_info_role_mapping (user_details_id, roles_id)
    VALUES (new_user_id, new_roles_id);
  END IF;
END $$;

-- 5) Teacher user
DO $$
DECLARE
  branch_id BIGINT;
  role_master_id_value BIGINT;
  new_user_id BIGINT;
  new_roles_id BIGINT;
BEGIN
  SELECT org_id INTO branch_id
  FROM fnd_organization_groups
  WHERE org_code = 'SOULBBSR_01'
  LIMIT 1;

  SELECT role_master_id INTO role_master_id_value
  FROM fnd_role_master
  WHERE role_master_name = 'TEACHER'
  LIMIT 1;

  IF branch_id IS NULL THEN
    RAISE EXCEPTION 'Branch SOULBBSR_01 not found';
  END IF;

  IF role_master_id_value IS NULL THEN
    RAISE EXCEPTION 'Role TEACHER not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_info WHERE email = 'teacher@gmail.com') THEN
    INSERT INTO user_info (
      user_details_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      dob,
      email,
      full_name,
      gender,
      is_active,
      is_email_verified,
      is_mobile_verified,
      mobile_no,
      branch_id,
      provider,
      user_image,
      user_signature
    ) VALUES (
      nextval('user_details'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      NULL,
      'teacher@gmail.com',
      'Teacher User',
      'Male',
      TRUE,
      TRUE,
      FALSE,
      9000000002,
      branch_id,
      'LOCAL',
      NULL,
      NULL
    ) RETURNING user_details_id INTO new_user_id;

    INSERT INTO user_credentials_db (
      user_credential_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      user_name,
      user_password,
      user_details_id
    ) VALUES (
      nextval('user_credential'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      'teacher@gmail.com',
      '$2a$10$HDCFEiHKf0VKySuIe/OdBOrrwM86OZ6ipDWXbC7SMOgtHBGFgVuUm',
      new_user_id
    );

    INSERT INTO roles_db (
      roles_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      role
    ) VALUES (
      nextval('user_roles'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      role_master_id_value
    ) RETURNING roles_id INTO new_roles_id;

    INSERT INTO user_info_role_mapping (user_details_id, roles_id)
    VALUES (new_user_id, new_roles_id);
  END IF;
END $$;

-- 6) Admin user
DO $$
DECLARE
  branch_id BIGINT;
  role_master_id_value BIGINT;
  new_user_id BIGINT;
  new_roles_id BIGINT;
BEGIN
  SELECT org_id INTO branch_id
  FROM fnd_organization_groups
  WHERE org_code = 'SOULBBSR_01'
  LIMIT 1;

  SELECT role_master_id INTO role_master_id_value
  FROM fnd_role_master
  WHERE role_master_name = 'ADMIN'
  LIMIT 1;

  IF branch_id IS NULL THEN
    RAISE EXCEPTION 'Branch SOULBBSR_01 not found';
  END IF;

  IF role_master_id_value IS NULL THEN
    RAISE EXCEPTION 'Role ADMIN not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_info WHERE email = 'admin@gmail.com') THEN
    INSERT INTO user_info (
      user_details_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      dob,
      email,
      full_name,
      gender,
      is_active,
      is_email_verified,
      is_mobile_verified,
      mobile_no,
      branch_id,
      provider,
      user_image,
      user_signature
    ) VALUES (
      nextval('user_details'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      NULL,
      'admin@gmail.com',
      'Admin User',
      'Male',
      TRUE,
      TRUE,
      FALSE,
      9000000003,
      branch_id,
      'LOCAL',
      NULL,
      NULL
    ) RETURNING user_details_id INTO new_user_id;

    INSERT INTO user_credentials_db (
      user_credential_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      user_name,
      user_password,
      user_details_id
    ) VALUES (
      nextval('user_credential'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      'admin@gmail.com',
      '$2a$10$HDCFEiHKf0VKySuIe/OdBOrrwM86OZ6ipDWXbC7SMOgtHBGFgVuUm',
      new_user_id
    );

    INSERT INTO roles_db (
      roles_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      role
    ) VALUES (
      nextval('user_roles'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      role_master_id_value
    ) RETURNING roles_id INTO new_roles_id;

    INSERT INTO user_info_role_mapping (user_details_id, roles_id)
    VALUES (new_user_id, new_roles_id);
  END IF;
END $$;

-- 7) Super admin user
DO $$
DECLARE
  branch_id BIGINT;
  role_master_id_value BIGINT;
  new_user_id BIGINT;
  new_roles_id BIGINT;
BEGIN
  SELECT org_id INTO branch_id
  FROM fnd_organization_groups
  ORDER BY org_id
  LIMIT 1;

  SELECT role_master_id INTO role_master_id_value
  FROM fnd_role_master
  WHERE role_master_name = 'SUPER_ADMIN'
  LIMIT 1;

  IF branch_id IS NULL THEN
    RAISE EXCEPTION 'No branch found';
  END IF;

  IF role_master_id_value IS NULL THEN
    RAISE EXCEPTION 'Role SUPER_ADMIN not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM user_info WHERE email = 'superadmin@gmail.com') THEN
    INSERT INTO user_info (
      user_details_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      dob,
      email,
      full_name,
      gender,
      is_active,
      is_email_verified,
      is_mobile_verified,
      mobile_no,
      branch_id,
      provider,
      user_image,
      user_signature
    ) VALUES (
      nextval('user_details'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      NULL,
      'superadmin@gmail.com',
      'Super Admin User',
      'Male',
      TRUE,
      TRUE,
      FALSE,
      9000000004,
      branch_id,
      'LOCAL',
      NULL,
      NULL
    ) RETURNING user_details_id INTO new_user_id;

    INSERT INTO user_credentials_db (
      user_credential_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      user_name,
      user_password,
      user_details_id
    ) VALUES (
      nextval('user_credential'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      'superadmin@gmail.com',
      '$2a$10$HDCFEiHKf0VKySuIe/OdBOrrwM86OZ6ipDWXbC7SMOgtHBGFgVuUm',
      new_user_id
    );

    INSERT INTO roles_db (
      roles_id,
      created_by,
      creation_date_time,
      updated_by,
      updation_date_time,
      role
    ) VALUES (
      nextval('user_roles'),
      NULL,
      NOW(),
      NULL,
      NOW(),
      role_master_id_value
    ) RETURNING roles_id INTO new_roles_id;

    INSERT INTO user_info_role_mapping (user_details_id, roles_id)
    VALUES (new_user_id, new_roles_id);
  END IF;
END $$;

COMMIT;