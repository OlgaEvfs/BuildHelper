# BuildHelper Testing Documentation

## 1. Testing Strategy Overview
The project uses a multi-layered testing approach (Testing Pyramid):
1.  **Unit Tests:** Testing model logic and individual utility functions.
2.  **Integration Tests (API):** Verifying API routes' interaction with the database and the correctness of middleware.
3.  **E2E Tests (End-to-End):** Testing critical user scenarios via the browser.

## 2. Tools
*   **Backend:** Jest, Supertest.
*   **E2E:** Playwright.
*   **Reporting:** Standard Jest reports + Playwright HTML Report.

## 3. Testing Scope

| Component | Testing Type | What we test |
| :--- | :--- | :--- |
| **Auth** | Unit/Int | Registration, login, tokens, `authMiddleware`, `adminMiddleware`. |
| **Models** | Unit | Data schemas, field validation (`User`, `Calculation`, `News`, etc.). |
| **Routes** | Int | CRUD operations for all entities (Checklist, Planner, News, Support). |
| **UI (Frontend)** | E2E | Guest, authorized user, and admin scenarios. |

## 4. Test Case Plan Example

### A. Integration Tests (API)
*   **Auth:**
    *   `POST /auth/register`: Successful registration, duplicate email handling.
    *   `POST /auth/login`: Successful login, wrong password handling.
    *   `Middleware`: Access to protected routes without/with invalid token.
*   **CRUD (e.g., `newsRoutes.js`):**
    *   `GET /news`: Fetching the list.
    *   `POST /news`: Creating (admin only).
    *   `DELETE /news/:id`: Deleting (admin only).
*   **Negative Testing:** Checking handling of incorrect input data for all APIs (expecting 400 Bad Request).

### B. E2E Tests (Playwright)
*   **Guest Scenario (`guest.spec.js`):**
    *   Navigate home, view news, attempt login with invalid credentials.
*   **User Scenario:**
    *   Register -> Login -> Create a Planner entry -> Verify presence in profile.
*   **Admin Scenario:**
    *   Login as admin -> Access `/admin.html` -> Delete user/news.