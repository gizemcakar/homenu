# HoMenu - Find Recipes with Ingredients at Home

HoMenu is a modern and elegant web application that allows you to find the most suitable recipes you can prepare by entering the ingredients you have at home.

## 🚀 Technology Stack

* **Frontend/Backend:** Next.js (App Router, Server & Client Components)
* **Database:** Supabase (PostgreSQL)
* **ORM:** Prisma
* **Authentication:** NextAuth.js & bcrypt
* **Design & Styling:** TailwindCSS v4 (Modern HSL color palettes and premium smooth animations)

---

## 🌟 Key Features

1. **Ingredient-Based Search:** Advanced search engine allowing filtering by comma-separated ingredients with AND (contains all) and OR (contains any) query modes.
2. **User Registration/Login (Auth):** Secure authentication with NextAuth.
3. **Dynamic Recipe Creation (CRUD):** Advanced interface to dynamically add ingredients, measurements, and preparation steps.
4. **Recipe Details and Portion Scaling:** Dynamic portions adjustment algorithm calculating ingredient quantities based on the number of servings selected in decimal format.
5. **Favorite System:** Real-time heart button interaction and personalized "My Favorites" dashboard.
6. **Privacy-Managed Profile Page:** A personal panel where users can list their created and favorited recipes, and manage privacy visibility levels for their profile data.

---

## 📁 Directory Structure

```text
homenu/
├── generated/           # Prisma Client generated files
│   └── prisma/
├── homenu/              # Next.js application source code
│   ├── prisma/          # Prisma schema definition and migration files
│   ├── public/          # Static assets (images, icons)
│   └── src/
│       ├── app/         # Pages, API routes, and layouts
│       └── components/  # Reusable UI components
├── prisma/              # Root-level database configuration
├── .gitignore           # Git ignore patterns
└── README.md            # Project overview and documentation
```

---

## 🛠️ Setup and Running Locally

### 1. Install Dependencies

```bash
cd homenu/homenu
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `homenu/homenu` directory (ignored by git) and add your Supabase PostgreSQL connection URI:

```env
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"
NEXTAUTH_SECRET="your-at-least-32-chars-long-secure-secret-key"
```

### 3. Sync Database Schema and Generate Prisma Client

To apply the schema definition to your database and generate the Prisma Client:

```bash
# Generate the Prisma client code
npx prisma generate
```

### 4. Run the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` on your browser to view the application.
