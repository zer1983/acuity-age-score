# Patient Assessment Tool

A comprehensive patient acuity assessment application built with React, TypeScript, and Supabase.

## Features

- **Patient Assessment**: Complete patient acuity assessments with customizable questions
- **User Authentication**: Secure user registration and login with Supabase Auth
- **Assessment History**: View and edit previous assessments
- **Real-time Scoring**: Automatic calculation of patient acuity scores
- **Responsive Design**: Modern UI built with shadcn/ui and Tailwind CSS
- **Data Persistence**: All data stored securely in Supabase

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── AssessmentForm.tsx
│   ├── AssessmentHistory.tsx
│   ├── AssessmentQuestion.tsx
│   ├── AssessmentResults.tsx
│   ├── PatientDemographics.tsx
│   └── UserNav.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAssessmentData.ts
│   ├── useAssessmentStorage.ts
│   └── use-toast.ts
├── integrations/       # External integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/070ecb44-acb4-4e2a-a1cc-bf53a4cce86b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```sh
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**
   ```sh
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase Database**
   
   You'll need to create the following tables in your Supabase project:
   
   - `profiles` - User profiles
   - `assessments` - Assessment records
   - `assessment_answers` - Individual question answers
   - `Category` - Question categories
   - `Question` - Assessment questions
   - `answer` - Question answer options
   - `Population` - Population types (Adult/Pediatric)

5. **Start the development server**
   ```sh
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` to view the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: React Context, React Query
- **Form Handling**: React Hook Form, Zod validation
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Linting**: ESLint, TypeScript ESLint

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/070ecb44-acb4-4e2a-a1cc-bf53a4cce86b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
