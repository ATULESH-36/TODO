# TaskFlow — Productivity Dashboard

A modern full-stack To-Do application with a clean 3-column productivity dashboard UI.

## Tech Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React + Vite + Tailwind CSS |
| Backend  | Python Flask (REST API)     |
| Database | SQLite                      |
| Icons    | Lucide React                |

## Project Structure

```
TODO/
├── frontend/          # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TaskList.jsx
│   │   │   └── TaskDetail.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── nginx.conf
├── backend/           # Flask API
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Run Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API server starts at **http://localhost:5000**.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173** with API requests proxied to the backend.

## Run with Docker

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

| Method | Endpoint          | Description       |
|--------|-------------------|-------------------|
| GET    | /api/tasks        | List all tasks    |
| POST   | /api/tasks        | Create a task     |
| PUT    | /api/tasks/:id    | Update a task     |
| DELETE | /api/tasks/:id    | Delete a task     |
| GET    | /api/lists        | List all lists    |
| POST   | /api/lists        | Create a list     |
| DELETE | /api/lists/:id    | Delete a list     |
