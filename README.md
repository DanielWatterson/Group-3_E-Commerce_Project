# WoodCraft Workshop - Group 3 E-Commerce Project

Full-stack e-commerce platform for customizable wood furniture, including:
- Product browsing and cart checkout
- Customer authentication
- PayFast payment flow
- 3D custom builder
- AR virtual showroom (marker-based)
- B2B view and reporting endpoints

## Tech Stack
- Frontend: Vue 3, Vite, Vue Router, Vuex, PrimeVue, TresJS, A-Frame/AR.js
- Backend: Node.js, Express, MySQL, JWT, bcrypt
- Payments: PayFast

## Project Structure
```text
Group-3_E-Commerce_Project/
  backend/
  frontend/
  README.md
```

## Prerequisites
- Node.js: `^20.19.0` or `>=22.12.0`
- npm
- MySQL Server

## 1. Backend Setup
From the project root:

```bash
cd backend
npm install
```

### Backend Environment Variables
Create `backend/.env` with:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=add_your_password_here
DB_DATABASE=e_commerce
JWT_SECRET=KQ6jWpYjzZxO9Q1iQLpOGYejxcS0GiOKzd8cHumGcTt

NODE_ENV=development
NGROK_AUTHTOKEN=3A72yWg6a9oAUqCi9bQTMg9hQEQ_5Xdarzn1KHB7cvXAz1YDY
ENABLE_NGROK=true

# PayFast
PAYFAST_MODE=sandbox
PAYFAST_MERCHANT_ID=10046111
PAYFAST_MERCHANT_KEY=46x04yxzlj934
PAYFAST_PASSPHRASE=mysandbox12345

# URLs used for PayFast redirects and notify callback
FRONTEND_BASE_URL=http://localhost:5173
BACKEND_BASE_URL=https://uninstinctive-decagonal-miguel.ngrok-free.dev
```

### Database Setup
Create your database and import one of the SQL files in `backend/`:
- `ecommerce_p3.sql`
- `Dump20260227.sql`


### Run Backend
```bash
npm run dev
```

Backend runs on `http://localhost:5050` by default.

## 2. Frontend Setup
From the project root:

```bash
cd frontend
npm install
```

Optional `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5050
```

### Run Frontend
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## 3. Run Full Project (Two Terminals)
Terminal 1:
```bash
cd backend
nodemon
```

Terminal 2:
```bash
cd frontend
npm run dev
```

## Useful Scripts
### Backend
- `npm nodemon` - start backend with nodemon


### Frontend
- `npm run dev` - start Vite dev server

## Notes and Troubleshooting
- If PayFast returns but payment stays pending locally, ensure:
  - `FRONTEND_BASE_URL` and `BACKEND_BASE_URL` are correct
  - ITN callback can reach backend (use ngrok if needed)
- AR view needs camera permission and a visible Hiro marker.
- If Vite shows template parse errors, check matching HTML tags in `.vue` templates.
- Never commit real secrets from `.env`.

## Contributors
Based on git history (consolidated names):
- Mogamat Toufeeq Farat
- Daniel Watterson
- Marco Erin Fisher
- Ebrahim Easton

## Relevant Features by Area
- Authentication: login/signup (`/login`, `/customer`)
- Catalog + cart: products, cart quantity management, checkout
- Payments: PayFast session creation, notify handling, payment status updates
- 3D builder: TresJS-based customization
- AR showroom: marker tracking with camera feed and overlay UI
- Reporting: discount/customer/product impact endpoints
