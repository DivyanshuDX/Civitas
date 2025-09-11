# DeCoMan - Decentralized Consent Manager

A decentralized consent management platform compliant with DPDPA 2023, built with Next.js, Supabase, and Algorand.

## Features

- User and organization dashboards
- Document access control with field-level permissions
- Blockchain-verified consent management
- Multi-language support (English and Hindi)
- Dark/light mode
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Copy the `.env.local.example` file to `.env.local` and fill in your Supabase credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

4. Run the development server:

\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Seed the database with demo accounts by visiting [http://localhost:3000/seed](http://localhost:3000/seed).

### Demo Accounts

After seeding the database, you can use the following accounts:

- User: `user@example.com` / `password123`
- Admin: `admin@example.com` / `password123`

## Database Schema

The application uses the following database tables:

- `users`: User accounts
- `algorand_accounts`: Algorand wallet details
- `documents`: User documents
- `document_fields`: Document fields
- `access_requests`: Document access requests
- `access_request_documents`: Documents requested in access requests
- `access_request_fields`: Fields requested in access requests
- `access_grants`: Granted document access
- `access_grant_fields`: Fields granted in access grants
- `access_history`: Audit trail of all actions
- `organizations`: Organization details

## Technologies Used

- Next.js 14
- Supabase (Auth, Database)
- Algorand (simulated)
- Tailwind CSS
- shadcn/ui
- TypeScript
- React Hook Form
- Zod
- Recharts

## License

MIT
