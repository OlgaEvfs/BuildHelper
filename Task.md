# Technical Requirements Specification: BuildHelper

**Version:** 1.0
**Date:** May 22, 2026
**Standard:** Compliance with ISO 29148:2018 (Requirements Engineering)

---

## 1. Introduction
### 1.1 Purpose
This document defines the requirements for the BuildHelper software—a digital assistant for builders and DIY enthusiasts. The purpose is to systematize functional and non-functional requirements to ensure high-quality development and maintenance.

### 1.2 Scope
The product is a web platform that includes:
- Material calculation tools.
- Interactive checklists for tracking renovation progress.
- Information section (construction industry news).
- Job search section in the construction and finishing industry.
- Content administration and user management.

---

## 2. General Description
### 2.1 Product Perspective
The system is a full-featured web application consisting of a client-side (Frontend) and a server-side (Backend) with a database (MongoDB).

### 2.2 User Characteristics
- **Guest:** Reading news, using calculators.
- **Registered User:** Saving calculations, tracking checklists, managing profile.
- **Administrator:** Full access to managing content, users, and support requests.

---

## 3. Functional Requirements

| ID | Requirement | Description |
| :--- | :--- | :--- |
| **FR-01** | Authentication | User registration and authorization using JWT. |
| **FR-02** | Calculators | Material calculation (wallpaper, tiles, paint, etc.) based on room parameters. |
| **FR-03** | Checklists | Creation, saving, and tracking of status for renovation tasks. |
| **FR-04** | Content Management | Creating, editing, and deleting news/vacancies (admin only). |
| **FR-05** | Support | Processing user requests via contact forms. |

---

## 4. Non-Functional Requirements
### 4.1 Reliability
The system must ensure correct data processing and robustness against incorrect input requests (server-side API validation).

### 4.2 Performance
API response time for major requests should not exceed 500 ms under normal load.

### 4.3 Maintainability
The code must be structured and covered by tests (Unit, Integration, E2E) according to the `TESTING.md` documentation.

---

## 5. Interface Requirements
- **Web Interface:** Adaptive for mobile and desktop devices (Bootstrap 5).
- **Localization:** Interface language — Russian.
- **Technologies:** Vanilla JS (ES6+), CSS3.

---