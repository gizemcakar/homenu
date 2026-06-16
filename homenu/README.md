# HoMenu Next.js Application

This is the Next.js web application for the HoMenu recipe finder project.

## 🚀 Getting Started

First, make sure you have installed the dependencies:

```bash
npm install
```

Then, configure your `.env` file inside this folder with the database connection details:

```env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
NEXTAUTH_SECRET="some-secure-secret-key"
```

Next, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🛠️ Prisma Database Commands

This project uses Prisma ORM to interact with the PostgreSQL database.

### Generate Prisma Client
Whenever you update the schema in `prisma/schema.prisma`, you need to regenerate the Prisma Client:
```bash
npx prisma generate
```

### Apply Migrations in Development
To apply schema updates in your development database and generate a new migration file:
```bash
npx prisma migrate dev --name your_migration_name
```

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
```

To run the production bundle locally:

```bash
npm start
```
