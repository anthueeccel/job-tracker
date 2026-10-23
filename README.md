# JobTracker Pro

> **Smart Spreadsheet Replacement for Tech Engineering & Management Job Search Pipelines**

JobTracker Pro is a modern, high-performance web application designed to replace clumsy spreadsheets when tracking job applications, multi-stage interviews, recruiter contacts, follow-up timelines, tailored resumes, and compensation targets.

It features dedicated tracks for **JobsTech** (Software Engineering, Cloud, DevOps, Architecture) and **JobsMgm** (Product Management, Scrum Master, Agile Coach, Engineering Leadership), complete with Google Calendar synchronization, automated follow-up reminder alerts, and persistent cloud synchronization backed by Firebase.

---

## Table of Contents

1. [Overview](#overview)
2. [How to Use This App](#how-to-use-this-app)
   - [Adding an Opportunity](#adding-an-opportunity)
   - [Editing an Opportunity](#editing-an-opportunity)
   - [Creating & Managing Notes](#creating--managing-notes)
   - [Changing Status & Advancing Interview Stages](#changing-status--advancing-interview-stages)
   - [Syncing Interviews with Google Calendar](#syncing-interviews-with-google-calendar)
   - [View Modes (List, Kanban, Calendar, Analytics)](#view-modes)
   - [Pagination & Horizontal Navigation](#pagination--horizontal-navigation)
3. [Exporting to CSV & Importing JSON](#exporting-to-csv--importing-json)
   - [Export to CSV (Spreadsheet)](#export-to-csv-spreadsheet)
   - [Export & Import JSON Backup](#export--import-json-backup)
   - [Using AI to Convert CSV/Spreadsheets to JSON](#using-ai-to-convert-csvspreadsheets-to-json)
   - [Browser Storage Scanner & Recovery](#browser-storage-scanner--recovery)
4. [Tech Stack](#tech-stack)
5. [How to Run This App Locally](#how-to-run-this-app-locally)
   - [Prerequisites](#prerequisites)
   - [Forking & Downloading](#forking--downloading)
   - [Environment Configuration](#environment-configuration)
   - [Installation & Running](#installation--running)
6. [Security & Zero-Trust Architecture](#security--zero-trust-architecture)

---

## Overview

Applying for jobs across multiple tracks often leads to chaotic spreadsheets where follow-up deadlines are missed, recruiter contact details are scattered across emails, and interview stage statuses become outdated.

**JobTracker Pro solves this with:**
- **Two First-Class Tracks**: Quickly toggle between `JobsTech` and `JobsMgm`, or inspect a consolidated `All Opportunities` view.
- **Visual Interview Stage Progress (X/Y)**: Instantly track whether an application has completed 0/3, 1/3, 2/3, or 3/3 interview rounds (HR Screening, Technical Challenge, System Design, Leadership Interview, etc.).
- **Follow-up Timing Engine**: Automatically flags applications needing outreach based on configurable reminder cadences (overdue, due today, or upcoming).
- **Direct Google Calendar Integration**: Sync interview rounds and outreach dates directly into your Google Calendar with 1-click links and event tracking.
- **Fast List with Pagination & Top/Bottom Scrollbars**: Smoothly navigate wide datasets with responsive 10, 30, 50, or All pagination, dual horizontal scrollbars, and sticky Action controls.

---

## How to Use This App

### Adding an Opportunity
1. Click the **+ New Opportunity** button (located on the far left of the top menu bar).
2. Enter the essential details:
   - **Company Name** and **Position Title**.
   - **Category**: Select `JobsTech` or `JobsMgm`.
   - **Initial Status**: Defaults to `Applied`, or choose `Interviewing`, `HR Screening`, `Tech Challenge`, etc.
   - **Application Date**: When you submitted your CV or initiated contact.
   - **Work Model**: Remote, Hybrid, or Onsite.
   - **Priority**: Mark as Low, Medium, High, or Dream Job.
   - **Target Compensation**: Expected salary range and currency.
3. Optionally add tailored resume names, job posting URLs, and recruiter contact info (Email, Phone/WhatsApp).
4. Click **Create Opportunity**.

### Editing an Opportunity
- **Quick Edit**: Click the **Edit (pencil icon)** button in the sticky **Actions** column on the far right of any row.
- **Detailed Drawer**: Click anywhere on a job row to open the full slide-over drawer, where you can update interview stages, recruiter contacts, compensation offers, and notes.
- Click **Save Changes** to commit updates.

### Creating & Managing Notes
1. Open the job's detail drawer by clicking on the opportunity row.
2. Scroll to the **Interview & Preparation Notes** section.
3. Type your note in the text box (e.g. key interview questions asked, recruiter feedback, salary negotiation notes, preparation checklists).
4. Click **Add Note**. Each note is time-stamped and preserved chronologically.

### Changing Status & Advancing Interview Stages
- **From the List tab**: Click directly on the **Status** badge in column 3 to cycle through statuses, or use the quick status dropdown to update it immediately.
- **From the Kanban board**: Switch to the **Kanban** tab in the top navigation to drag and drop application cards between stages (`Applied` ➔ `Screening` ➔ `Interviewing` ➔ `Tech Challenge` ➔ `Offer Received`).
- **Quick Stage Advancement (0/3 ➔ 1/3 ➔ 2/3)**: In the **Stage Progress** column, click the fast-forward button or click individual stages to mark them as `Completed`, `Scheduled`, or `Passed`.

### Syncing Interviews with Google Calendar
1. In the **Follow-up / Timing** column or inside the Job Drawer, click **Add to Calendar** or the calendar icon next to any interview stage.
2. If signed in with Google, you can sync the interview event with direct 1-click Google Calendar integration.
3. You can also click the direct Google Calendar web link to open the pre-filled event in Google Calendar with interview timing, meeting notes, and company title.

### View Modes
JobTracker Pro includes 4 specialized views accessible via the top view switcher:
1. **List View**: Enhanced high-density spreadsheet with sorting by Company, Stage Progress, Status, and Timing, complete with dual top and bottom horizontal scrollbars.
2. **Kanban View**: Visual drag-and-drop board organized by application status.
3. **Calendar View**: Chronological agenda and timeline of interview dates and upcoming outreach.
4. **Analytics View**: Conversion rate funnels, stage distribution, and application performance metrics.

### Pagination & Horizontal Navigation
- **Pagination**: Use the **Per page** toggle in the top or bottom toolbar to view **10** (default for maximum performance), **30**, **50**, or **All** items at once.
- **Horizontal Scrollbars**: A synchronized horizontal scrollbar is available at **both the top and the bottom** of the list.
- **Quick Navigation**: Use the **Start** and **End** buttons to jump instantly between the first column (Company) and the last column (Actions).

---

## Exporting to CSV & Importing JSON

Click the **Export / CSV** button in the top navigation bar to open the data management modal.

### Export to CSV (Spreadsheet)
- Click **Download CSV Spreadsheet**.
- Generates a UTF-8 compatible `.csv` file containing company names, positions, categories (`JobsTech`/`JobsMgm`), status, interview progress, timing dates, salary expectations, recruiter details, and notes.
- Fully compatible with Microsoft Excel, Google Sheets, LibreOffice, and Apple Numbers.

### Export & Import JSON Backup
- **Export Backup**: Click **Download Full JSON Backup** to export an exhaustive, structured JSON file with all relational stages, contacts, resumes, and timestamps.
- **Import Backup**: 
  1. Click **Choose File** in the Import section and select a valid `.json` backup file.
  2. Choose whether to **Merge with existing opportunities** or **Replace entire list**.
  3. Click **Import & Restore Data**.

### Using AI to Convert CSV/Spreadsheets to JSON
If you have an existing job tracking spreadsheet (from Excel, Notion, or Google Sheets) in CSV format and want to import it into JobTracker Pro:

1. Copy your CSV text or export a few rows.
2. Open your preferred AI assistant (such as **Google Gemini**, **Claude**, or **ChatGPT**).
3. Use the following prompt:

```text
Please convert the following spreadsheet data into a JSON array matching this exact schema for JobTracker Pro:

[
  {
    "id": "job-1",
    "title": "Senior Frontend Engineer",
    "company": "Acme Corp",
    "category": "JobsTech", // Must be "JobsTech" or "JobsMgm"
    "status": "interviewing", // One of: "applied", "screening", "interviewing", "tech_challenge", "offer", "standby", "rejected", "withdrawn"
    "statusDate": "2026-10-20",
    "stages": [
      { "id": "st-1", "name": "Technical Screen", "status": "completed", "date": "2026-10-18" },
      { "id": "st-2", "name": "System Architecture", "status": "scheduled", "date": "2026-10-25" }
    ],
    "location": "Remote, US/EU",
    "workModel": "remote", // "remote", "hybrid", or "onsite"
    "salaryExpected": "$160,000 - $180,000",
    "appliedDate": "2026-10-15",
    "contacts": [
      { "name": "Sarah Recruiter", "role": "Lead Tech Recruiter", "email": "sarah@acme.com" }
    ],
    "resumes": [
      { "id": "cv-1", "fileName": "Resume_Staff_Frontend.pdf", "versionLabel": "V2 - Architecture" }
    ],
    "notes": [
      { "id": "n-1", "content": "Initial call went great. Prep distributed systems for round 2.", "createdAt": "2026-10-18T14:00:00Z" }
    ]
  }
]

Here is my spreadsheet data:
[PASTE YOUR CSV OR TABLE DATA HERE]
```

4. Save the generated JSON to a file named `my_jobs.json` and upload it using the **Import JSON Backup** feature in JobTracker Pro.

### Browser Storage Scanner & Recovery
JobTracker Pro includes a built-in browser memory scanner. If you previously saved records in your browser under previous version keys, click **Scan & Recover** inside the Export/Import modal to automatically restore and merge any detected legacy applications.

---

## Tech Stack

- **Frontend Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (feather icons), [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Database & Sync**: [Firebase Firestore](https://firebase.google.com/products/firestore) (with long-polling connection resilience and Zero-Trust attribute-based security rules)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/products/auth) with Google Sign-In
- **Calendar Integration**: Google Workspace OAuth (Calendar API v3) with client-side token flow
- **Storage**: Real-time cloud sync with automatic offline-first `localStorage` mirroring

---

## How to Run This App Locally

### Prerequisites
- **Node.js**: Version 18.x or higher (or [Bun](https://bun.sh/))
- **npm** (comes with Node.js) or **bun**
- A modern web browser (Chrome, Edge, Firefox, or Safari)

### Forking & Downloading
1. Fork the repository on GitHub by clicking the **Fork** button in the top right.
2. Clone your fork to your local computer:
   ```bash
   git clone https://github.com/<your-username>/jobtracker-pro.git
   cd jobtracker-pro
   ```
   *(Alternatively, click **Code ➔ Download ZIP** and extract the archive.)*

### Environment Configuration
1. Duplicate the example environment file:
   ```bash
   cp .env.example .env
   ```
2. (Optional) If connecting to your own Firebase project, configure your Firebase credentials in `.env`:
   ```ini
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
   VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   ```
   *(Note: The app will run out of the box using local browser storage if Firebase environment variables are omitted.)*

### Installation & Running
1. Install project dependencies:
   ```bash
   npm install
   # or with bun:
   bun install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   # or with bun:
   bun run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

4. To build the production bundle:
   ```bash
   npm run build
   ```
   The compiled assets will be placed in the `dist/` directory.

---

## Security & Zero-Trust Architecture

- **Protected Repositories**: Client credentials and `firebase-applet-config.json` are excluded via `.gitignore` to prevent secret-scanning alerts.
- **Zero-Trust Firestore Rules (`firestore.rules`)**: All database operations strictly enforce that requests originate from verified, authenticated user accounts accessing only their own `/users/{userId}/jobs/{jobId}` records.
- **In-Memory Token Caching**: Google Calendar OAuth access tokens are held strictly in memory and are never persisted in unencrypted browser storage.
