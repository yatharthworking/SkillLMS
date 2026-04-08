# Backend-LMS

## Local development

The backend is configured for local PostgreSQL by default:

- Database: `lmsdb`
- Username: `lms`
- Password: `lms123`
- Backend URL: `http://localhost:8901/soul`

## Database setup

1. Create a PostgreSQL database named `lmsdb`.
2. Create user `lms` with password `lms123` and grant access.
3. Start the backend once so Hibernate can create/update tables.
4. Run these scripts against `lmsdb`:
   - `setup-postgres-local.sql`
   - `seed-postgres-demo-users.sql`

Demo logins after seeding:

- `student@gmail.com` / `Pass@123`
- `teacher@gmail.com` / `Pass@123`
- `admin@gmail.com` / `Pass@123`
- `superadmin@gmail.com` / `Pass@123`

## Start commands

Use the helper script:
```bat
start-backend-local.cmd
```

Or run Maven directly from `Backend-LMS`:
```bat
mvnw.cmd spring-boot:run -DskipTests
```

Spring configuration is now bundled under `src/main/resources/application.properties`, so packaged runs and local runs use the same defaults unless you override them with environment variables.
