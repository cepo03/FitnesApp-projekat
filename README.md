# FitnesApp

Aplikacija za praćenje planova treninga i napretka. Backend: **Flask** (Python), frontend: **React** (JavaScript), baza: **SQLite**.

## Šta aplikacija radi

- **Početna** – kratak opis aplikacije, linkovi za prijavu/registraciju ili Planovi/Napredak ako si ulogovan.
- **Registracija i prijava** – JWT autentifikacija.
- **Planovi** – kreiranje planova treninga (naziv, opis, trajanje u mesecima), dodavanje vežbi (naziv, broj ponavljanja, serije). Planovi i vežbe se mogu brisati i menjati.
- **Napredak** – kalendar sa označavanjem dana kada je trening odrađen, statistika (ukupno treninga, treninga u tekućem mesecu), lista označenih dana.

## Pokretanje

### 1. Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend radi na **http://localhost:5000**. Baza `fitness.db` se kreira u `backend/instance/` (ili u `backend/` u zavisnosti od Flask konfiguracije).

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend radi na **http://localhost:3000**. Vite proxy šalje `/api` zahteve na `http://localhost:5000`, tako da CORS i adrese rade ispravno.

### 3. Pokretanje u Dockeru

Potrebno: [Docker](https://docs.docker.com/get-docker/) i [Docker Compose](https://docs.docker.com/compose/install/).

```bash
# iz root foldera projekta (App)
docker compose up --build
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:5000**
- Baza se čuva u Docker volumenu `dbdata` (trajno).

Zaustavljanje: `Ctrl+C`, pa po želji `docker compose down`.

## Tehnologije

- **Backend:** Flask, Flask-CORS, Flask-Bcrypt, Flask-JWT-Extended, Flask-SQLAlchemy, SQLite
- **Frontend:** React 18, React Router 6, Vite, JavaScript (bez TypeScript)
