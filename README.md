# BuildHelper

BuildHelper is a digital assistant for builders and DIY enthusiasts. The platform allows users to calculate materials, track renovation progress through checklists, follow the latest construction news, and find suitable job openings.

## Key Features

- **Construction Calculators:** Quick calculation of required materials (wallpaper, tiles, paint, floor screed, blocks, etc.) based on room geometry.
- **Interactive Checklist:** Step-by-step renovation planning with progress saving.
- **News Feed:** Latest construction industry news, trends, material reviews, and technologies.
- **Job Section:** Job search in the construction and finishing industry.
- **User Profile:** Manage your profile, save calculations, and track renovation progress.
- **Admin Panel:** Manage users, content (news, job openings), and support requests.

## 🛠 Tech Stack

### Frontend
- HTML5, CSS3 (Bootstrap 5)
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (JSON Web Tokens) for authentication

## 📦 Installation and Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or MongoDB Atlas)

### Setup
1. Clone the repository:
   ```bash
   git clone <project-url>
   cd BuildHelper
   ```
2. Install dependencies (in the project root):
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root and add the necessary environment variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Seed the database with initial data (news, users). The script will automatically create an administrator (`admin@buildhelper.ee` / `password123`):
   ```bash
   node backend/seed.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

> **Important:** After running the `seed.js` script, it is highly recommended to log in as the administrator and change the default password (`password123`).

## 🔧 Troubleshooting

- **MongoDB connection error:** Ensure that MongoDB is running and the `MONGO_URI` in `.env` is correct.
- **Port occupied:** If an `EADDRINUSE` error occurs when starting the server, change the `PORT` variable in your `.env` file to any free port (e.g., `4000`).
- **Missing data:** If content is not displayed after starting the server, ensure you have executed `node backend/seed.js`.

## 🤝 Contributing

We welcome any suggestions to improve the project!
1. Fork the repository.
2. Create a branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make changes and commit them.
4. Push the changes to your fork and create a Pull Request.

## 🏗 Project Structure

```text
BuildHelper/
├── backend/       # Server-side (API, models, controllers)
├── frontend/      # Client-side (HTML, CSS, JS)
├── e2e/           # E2E tests (Playwright)
└── playwright.config.js
```

## 🧪 Testing

The project uses a multi-layered testing approach:

- **Unit & API Tests (Jest/Supertest):** Testing model logic, middleware, and API CRUD operations.
  ```bash
  npm test
  ```
- **E2E Tests (Playwright):** Testing critical user scenarios.
  ```bash
  npx playwright test
  ```

For detailed information on strategy, coverage, and test cases, see the [TESTING.md](TESTING.md) file.

## 📄 License
This project is licensed under the [MIT](LICENSE) license.
