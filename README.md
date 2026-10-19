# 📝 Notion Clone – Full-Stack Modular Workspace

A production-grade, modular workspace and rich-text publishing platform inspired by Notion. Built with the Next.js App Router, React, TipTap, and MongoDB Atlas, this application delivers a block-based editing experience with slash commands, database tables, multi-format media embeds, and hybrid authentication.

### 🔗 Quick Links

- **Live Demo:** Workspace Demo
- **GitHub Repository:** Source Code

### 🚀 Key Features

- **Block-Based Rich-Text Engine:** Built on TipTap with custom node views, draggable handles, callouts, toggles, multi-column layouts, and interactive task lists.
- **Database Views & Relational Data:** Inline databases supporting Table, Board/Kanban, and Gallery views with custom property schemas (Select, Status, Dates, Files, Formulas, and Relations).
- **Interactive Slash Commands (`/`):** Floating keyboard-driven command palette implemented with Tippy.js to spawn blocks, embeds, tables, and formatting tools instantly.
- **Math & Media Integrations:** Live LaTeX equation rendering (via KaTeX inline and block nodes), client-side PDF document parsing (`pdfjs-dist`), CSV data import/export (`PapaParse`), and responsive image/video embedding.
- **Web Bookmarks & Rich Previews:** Server-side metadata extraction (`Cheerio`) to generate rich bookmark cards for external URLs.
- **Dual Authentication Flow:** Flexible user onboarding with Google OAuth 2.0 and passwordless Magic Link emails via Resend.
- **Workspace Personalization:** Per-page icon picker (native emojis + Lucide icons), cover assets, breadcrumbs, document trees, and full Dark/Light theme switching.

### 🏗 Architectural Overview

- **Frontend:** React, Next.js (App Router), Tailwind CSS for responsive styling, Lucide React for consistent UI iconography, and `emoji-picker-react`.
- **Editor Core:** Headless TipTap core architecture (`@tiptap/react`, `@tiptap/core`, `@tiptap/starter-kit`) augmented with custom React node views and headless UI popovers via `tippy.js`.
- **Parsing & Rendering:** `KaTeX` for formula compilation, `pdfjs-dist` for PDF asset rendering, `papaparse` for tabular data parsing, and `marked` for Markdown translation.
- **Backend & API:** Next.js Server Actions and Route Handlers utilizing `cookies()` and secure HTTP-only headers.
- **Data Layer:** MongoDB Atlas accessed via the official `mongodb` driver with optimized client connection caching.
- **Authentication & Mail:** Google Identity Services (`@react-oauth/google`) combined with `Resend` for passwordless tokenized magic links.

### 🛠 Local Development Setup

#### 1. Prerequisites

- **Node.js:** v18.17.0 or higher
- **Package Manager:** `npm` or `pnpm`
- **Database:** Active MongoDB Atlas cluster or local MongoDB instance

#### 2. Installation

Clone the repository and install all required dependencies:

Bash

```
git clone https://github.com/your-username/notion-web.git
cd notion-web
npm install
```

#### 3. Environment Configuration

Create a `.env.local` file in the project root:

Code snippet

```
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notion-db?retryWrites=true&w=majority

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Email Delivery
RESEND_API_KEY=re_your_resend_api_key
```

#### 4. Running the Development Server

Bash

```
npm run dev
```

Open http://localhost:3000 to access your workspace.

### 👩‍💻 Author

**Neha Kondabathini** | Adelaide, Australia

nehakondabathini1234@gmail.com
