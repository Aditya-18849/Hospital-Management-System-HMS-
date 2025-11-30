# HMS Frontend (React + Vite)

This is the frontend scaffold for the Health Management System (HMS). It's a Vite + React 18 app using Material UI and Axios.

Quick start (PowerShell on Windows):

```powershell
# install deps
npm install

# start dev server
npm run dev
```

Environment:
- The API base URL is read from `VITE_API_URL` in `.env` (defaults to `http://localhost:4000/api`).

Project layout (important files):
- `src/services/api.js` — Axios instance and helpers (`get`, `post`, `put`, `del`, `setAuthToken`).
- `src/components/HospitalForm.jsx` — hospital registration form.
- `src/pages` — route pages: `Home`, `HospitalRegister`, `HospitalActivation`, `Dashboard`, `Login`, `NotFound`.
- `src/components/Layout.jsx` — AppBar and basic navigation.

Next steps I can help with:
- Implement backend endpoints or a mock server for testing.
- Add form validation and better error handling.
- Add authentication flow and protected routes.
- Deploy instructions and CI.
