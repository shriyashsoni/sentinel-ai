# SentinelAI Frontend

React + Vite frontend for SentinelAI with:

- 3D animated hero scene (React Three Fiber)
- Whitepaper and About pages
- Wallet connection (Wagmi + MetaMask)
- Onchain contract reads (Sepolia GuardianVault)
- Backend pipeline integration (FastAPI)

## Run

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`

## Backend requirement

Start backend in project root before using dashboard pipeline actions:

```bash
uvicorn backend.app:app --reload --port 8000
```

## Build

```bash
npm run build
```

## Routes

- `/` Home + 3D hero
- `/dashboard` Risk dashboard, wallet + backend flow
- `/whitepaper` Whitepaper page
- `/about` About page
