# Master Finance

Full-stack app to track income, expenses, categories, and savings goals.

## Tech Stack
- Backend: Spring Boot, Java 21, Supabase (PostgreSQL)
- Frontend: Angular 17, Angular Material

## Project Structure
- backend/finance-backend: Spring Boot API
- frontend: Angular app

## Prerequisites
- Java 21
- Maven
- Node.js + npm
- Supabase project (PostgreSQL)

## Backend
1. Run the API:

```bash
cd backend/finance-backend
./mvnw spring-boot:run
```

The API runs on http://localhost:8080.

Swagger UI: http://localhost:8080/swagger-ui.html
OpenAPI JSON: http://localhost:8080/api-docs

## Frontend
1. Install dependencies (if needed):

```bash
cd frontend
npm install
```

2. Start the Angular app (proxy to backend is configured):

```bash
npm start
```

The app runs on http://localhost:4200.
