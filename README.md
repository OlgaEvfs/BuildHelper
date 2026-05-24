# BuildHelper

BuildHelper is a digital assistant for builders and DIY enthusiasts. The platform allows users to calculate materials, visualize room layouts, track renovation progress through checklists, follow the latest construction news, and find suitable job openings.

## Key Features

- **Construction Calculators:** Quick calculation of required materials (wallpaper, tiles, paint, floor screed, blocks, etc.) based on room geometry (10 specialized modules).
- **2D Room Planner:** An interactive tool for visualizing rooms and arranging furniture, built using the **Canvas API**.
- **Interactive Checklist:** Step-by-step renovation planning with real-time progress saving to the user profile.
- **News Feed & Jobs Board:** Industry trends, material reviews, and a specialized job search section for the construction industry.
- **Admin Panel:** Comprehensive dashboard for user management, content moderation (news/jobs), and support request handling.

## 🛠 Tech Stack

### Frontend
- HTML5, CSS3 (Bootstrap 5)
- JavaScript (ES6+, **Canvas API** for the planner)

### Backend
- Node.js & Express.js
- MongoDB (Mongoose ODM)
- JWT (JSON Web Tokens) for secure authentication
- Leo-profanity for automatic content moderation

## 📦 Installation and Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local server or MongoDB Atlas)

### Setup
1. Clone the repository:
   ```bash
   git clone <project-url>
   cd BuildHelper
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/buildhelper
   JWT_SECRET=your_secret_key
   ```
4. Seed the database with initial data (news, jobs, and admin account):
   ```bash
   node backend/seed.js
   ```
   *Default Admin:* `admin@buildhelper.ee` / `password123`

5. Start the server:
   ```bash
   npm start
   ```

## 🧪 Testing

The project implements a robust automated quality control system:

- **Unit & API Tests (Jest):** Testing model logic, middleware, and API endpoints. 
  ```bash
  npm test
  ```
  *Note: Tests run in sequential mode (`--runInBand`) to ensure stability on Windows environments.*

- **E2E Tests (Playwright):** Testing critical user journeys in real browsers.
  ```bash
  npx playwright test
  ```

## 🏗 Project Structure

```text
BuildHelper/
├── backend/       # API, Models, Controllers, and Middleware
├── frontend/      # UI, CSS, and Client-side Logic
├── e2e/           # Playwright End-to-End Tests
└── docs/          # Documentation and Media assets
```

## 📄 License
This project is licensed under the MIT License.
