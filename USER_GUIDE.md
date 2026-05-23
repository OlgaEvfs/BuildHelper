# BuildHelper User Guide

Digital Assistant for Construction and Renovation
________________________________________

## 1. Introduction

### 1.1 Product Name and Version
**Product Name:** BuildHelper  
**Version:** 1.0

### 1.2 Purpose of the Application
BuildHelper is a multi-functional web service created for professional builders and DIY enthusiasts. The application allows you to:
- Perform accurate construction material calculations using 10 built-in calculators.
- Design rooms in a 2D planner and transfer data for calculations.
- Track renovation progress via an interactive checklist.
- Read the latest construction industry news and search for job openings.
- Manage content and users (for administrators).

### 1.3 Target Audience
- **Contractors and Builders:** for quick estimation of material volume on site.
- **DIYers:** for planning renovation stages and budgets.
- **Administrators and Editors:** for maintaining the portal's information base.

### 1.4 Key Features Overview
- **Construction Calculators:** calculation of paint, wallpaper, tiles, floor screed, drywall, and more.
- **2D Planner:** creating room drawings, placing furniture, and accounting for windows/doors.
- **Interactive Checklist:** step-by-step renovation plan with progress saving.
- **"News and Jobs" Section:** viewing articles and job offers.
- **User Profile:** saving calculation history and floor plan projects.
- **Admin Panel:** managing users, news, and support requests.

________________________________________
## 2. General Information

### 2.1 System Requirements
**Operating System:** Windows 10+, Linux, macOS, Android/iOS (responsive design).  
**Browsers:** Google Chrome, Mozilla Firefox, Safari, Microsoft Edge (latest versions).  
**Minimum Resolution:** correct display on smartphones and desktops (Bootstrap 5).

### 2.2 Supported Languages
- **Russian** (the interface is fully localized into Russian).
- **English** (documentation only).

### 2.3 Limitations
- A stable internet connection is required.
- Saving data to the profile and access to the planner require authorization.
- Access to portal management is restricted to administrator rights.

________________________________________
## 3. Getting Started

### 3.1 Gaining Access
To access the portal, go to the URL:
[http://localhost/BuildHelper](http://localhost/BuildHelper) (or the address provided by your system administrator).

### 3.2 Registration
1. Click the "Registration" button in the navigation menu.
2. Fill out the form: username, valid Email, and password (minimum 6 characters).
3. After confirmation, you will be automatically logged in.

### 3.3 Authorization
1. Click the "Login" button.
2. Enter your Email and password.
3. The system uses JWT tokens to ensure the security of your session.

### 3.4 Account Setup
In your personal account, you can:
- View saved material calculations.
- Return to editing your 2D plans.
- Change personal data.

________________________________________
## 4. Interface and Navigation

### 4.1 Key Elements
- **Header:** navigation menu, switching sections, and profile login.
- **Home Page:** access to calculators, news, and the feedback form.
- **Side Panel (in the planner):** tools for adding objects and changing their properties.
- **Footer:** legal information and contacts.

### 4.2 Site Prototype
An interactive interface prototype is available at the following link:
[Figma Prototype](https://www.figma.com/design/UpZODBAycUqf9D1cU5KNTv/icon?node-id=0-1&t=F4iubVksagEAMaW2-1)

________________________________________
## 5. Main Functions (Detailed)

### 5.1 Using Calculators
1. Select the desired calculator on the home page (e.g., "Wallpaper" or "Tiles").
2. Enter room parameters or click the "Master Calculation" (Geometry) button for automatic area calculation.
3. Click the "Calculate" button.
4. For authorized users, a **"Save to Profile"** button is available.

### 5.2 2D Planner
1. Go to the "Planner" section.
2. **Adding walls:** enter length and width, click "Add Room".
3. **Objects:** add furniture or plumbing for visualization. Use mouse/touch to move (snapping to walls is enabled).
4. **Openings:** add windows and doors to the selected room.
5. **Synchronization:** Click **"Apply All"** to transfer wall and floor area data to the material calculators.

### 5.3 Interactive Checklist
1. Go to the checklist section.
2. Mark completed work stages (rough-in, finishing, decor).
3. The indicator at the top will show the overall percentage of renovation completion. The state is automatically saved in the browser.

### 5.4 Comments and Discussions
Users can discuss news and jobs:
- **Reading:** Comments are available to all visitors at the bottom of the news or job page.
- **Adding:** To leave a comment, you must be logged in. The input form will appear below the article text.
- **Deletion:** Comment authors can delete their messages. Administrators have the right to delete any comments to maintain order.

### 5.5 Admin Panel
Administrators have access to the following functions:
- **User Management:** view the list, delete, or change roles.
- **Content Management:** creating news with image uploads, publishing job vacancies.
- **Support:** viewing and processing applications from users via the feedback form.
- **Moderation:** deleting inappropriate comments.

________________________________________
## 6. Security and Support

### 6.1 Security
- Passwords are stored in encrypted form (Bcrypt).
- All API requests are protected by server-side access control.

### 6.2 Common Errors
- **"Email already exists":** use a different address or restore access.
- **"Server connection error":** check your internet connection or MongoDB status.

### 6.3 Support
For all questions, please contact:
- **Email:** olga.evstafieva@ivkhk.ee
- **Phone:** +372 56899632
- **Website Form:** "Write to us" block on the home page.