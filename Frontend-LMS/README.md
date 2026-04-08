# Frontend-LMS

## Local development

1. Install dependencies:
```bash
npm install
```

2. Confirm the frontend env points at the backend:
```env
REACT_APP_BASEURL=http://localhost:3000
REACT_APP_LMS_BACKEND_BASE_URL=http://localhost:8901/soul
REACT_APP_LMS_ORGANISATION_NAME=SkillLMS
REACT_APP_ORGANISATION_ID=1
```

3. Start the app:
```bash
npm start
```

The frontend runs on `http://localhost:3000` and talks to the backend at `http://localhost:8901/soul`.
