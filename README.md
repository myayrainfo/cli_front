# Clinic ERP Frontend

Clinic ERP is a pharmacy-first clinic management system designed to help small clinics and medical stores manage stock, billing, purchases, patient activity, alerts, and reports from one dashboard.

This is the React + Vite frontend for the Clinic ERP project.  

## Run locally

```bash
npm install
npm run dev
```

The frontend uses the local Vite port configured for this app and connects to the backend API.

## Frontend architecture

The frontend is organized by shared app shell + feature modules:
- `src/app` contains app entry and routing
- `src/core` contains auth setup
- `src/shared` contains layouts, reusable components, and utilities
- `src/modules` contains page-level ERP features like dashboard, inventory, billing, and clinic

This keeps the main layout reusable while each module owns its page logic.


## Build

```bash
npm run build
```
