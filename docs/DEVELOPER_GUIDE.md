# Community App - Developer Guide

Welcome to the Developer Guide for the Community Management App. This document provides a deep dive into the system architecture, database schema, algorithmic complexities, and standard operating procedures for extending the codebase.

---

## Architecture Overview

### System Architecture
The application follows a standard modern decoupled client-server architecture:
`Browser (React) → HTTP/REST via Axios → Express.js Server → MySQL Database`

### Frontend Architecture
Located in `community-frontend-new/`:
- **Framework**: TanStack Start (Provides file-based routing and SSR capabilities).
- **State Management**: React Query (`@tanstack/react-query`) handles all server state, caching, and invalidation.
- **HTTP Client**: Axios configured with interceptors for JWT injection.
- **UI Components**: Shadcn UI combined with Base UI, heavily relying on Tailwind CSS for utility-first styling. Icons are provided by Lucide React, and toast notifications by Sonner.

### Backend Architecture
Located in `community-app-backend-dev/`:
- **Framework**: Express.js REST API written in TypeScript.
- **Database Driver**: `mysql2/promise` using raw SQL queries with parameterized inputs to prevent SQL injection.
- **Authentication**: Stateless JWT (JSON Web Tokens) generated upon OTP verification.
- **File Uploads**: Handled via Multer (stores files in designated public directories).
- **Logging**: Winston logger captures error traces and system events in `logs/`.

---

## Project Setup (Detailed)

### Prerequisites
- **Node.js**: v22.0.0 or higher.
- **MySQL**: 8.0 or higher.
- **Package Manager**: npm v10+.
- **Tools**: MySQL Workbench or DBeaver for database visualization is highly recommended.

### Step-by-Step Setup
1. **Clone the Repository**: Fetch the code from your version control system.
2. **Database Setup**:
   - Open MySQL Workbench.
   - Create the schema: `CREATE DATABASE community_app;`
   - Import the base tables: Run `docs/complete_base_schema.sql`
   - Import the graph/family features: Run `docs/family_graph_schema.sql`
3. **Backend Setup**:
   - `cd community-app-backend-dev`
   - `npm install`
   - Copy `.env.example` to `.env` and fill in DB credentials.
   - Run `npm run dev`. The server starts on `http://localhost:4002`.
4. **Frontend Setup**:
   - `cd community-frontend-new`
   - `npm install`
   - Create `.env` and set `VITE_API_URL=http://localhost:4002`.
   - Run `npm run dev`.
5. **Verification**: Navigate to `http://localhost:3000` (or `5173`) and test the login using OTP `221221`.

### Environment Variables

#### Backend (`.env`)
- `PORT`: (Optional) Default is 4002.
- `DB_HOST`: (Required) Database host (e.g., `localhost`).
- `DB_USER`: (Required) Database username.
- `DB_PASSWORD`: (Required) Database password.
- `DB_NAME`: (Required) Database name (`community_app`).
- `JWT_SECRET`: (Required) Secret key for signing auth tokens.
- `FRONTEND_URL`: (Optional) Used for CORS configuration.

#### Frontend (`.env`)
- `VITE_API_URL`: (Required) Points to the backend Express server.

---

## Database Schema

### Tables Overview (27 tables)
*Here is a high-level summary of critical tables. Refer to the SQL files for exact DDL.*

1. **`tbl_members`**: Core user table. Keys: `member_id`, `member_uuid`, `phone_number`, `family_id`.
2. **`tbl_family`**: Represents a distinct family unit. Keys: `family_id`, `family_uuid`, `head_member_id`.
3. **`tbl_family_graph`**: Node-edge mapping for the family tree. Keys: `from_member_id`, `to_member_id`, `relationship_type`.
4. **`tbl_family_join_requests`**: Tracks users requesting to merge into a `family_id`. Keys: `request_uuid`, `requester_id`, `target_family_id`, `status`.
5. **`tbl_ai_family_matches`**: Stored results of the scanner. Keys: `match_uuid`, `user_a_id`, `user_b_id`, `confidence_score`.
6. **`tbl_committee_members`**: Community leaders. Keys: `committee_id`, `member_id`, `role_name`.
7. **`tbl_businesses`**: Business directory. Keys: `business_uuid`, `owner_id`, `category`.
8. **`tbl_news_feed`**: Notice board items. Keys: `news_uuid`, `news_type`, `event_date`.
9. **`tbl_donors`**: Donor logs. Keys: `donor_id`, `member_id` (nullable), `is_lifetime_donor`.
10. **`tbl_abroad_member`**: NRI tracking. Keys: `abroad_uuid`, `country`, `city`.
11. **`tbl_marksheets`**: Student uploads. Keys: `marksheet_uuid`, `user_id`, `percentage`, `is_approved`.
12. **`tbl_photo_albums`**: Gallery folders. Keys: `album_uuid`, `folder_name`.
13. **`tbl_photos`**: Individual gallery images. Keys: `photo_uuid`, `photo_album_id`.

### Entity Relationship Diagram (Text-based)
```text
[tbl_family] 1 <----- N [tbl_members]
                              |
                              +--- 1:N ---> [tbl_family_graph] (Self-referencing relationships)
                              +--- 1:N ---> [tbl_businesses]
                              +--- 1:N ---> [tbl_marksheets]
                              +--- 1:1 ---> [tbl_committee_members]
[tbl_photo_albums] 1 <----- N [tbl_photos]
```

---

## Frontend Routes
Configured via TanStack Start file-based routing in `src/routes/`:
- `/` (Redirects to dashboard or login)
- `/(auth)/login`
- `/(auth)/register`
- `/(app)/dashboard`
- `/(app)/family-tree`
- `/(app)/members`
- `/(app)/find-family`
- `/(app)/family-requests`
- `/(app)/my-requests`
- `/(app)/notice-board`
- `/(app)/committee`
- `/(app)/profile`
- `/(app)/business`
- `/(app)/donors`
- `/(app)/abroad-members`
- `/(app)/marksheets`
- `/(app)/gallery`
- `/(app)/notifications`
- `/(app)/settings`
- `/(app)/admin` (Contains AI Suggestions)

---

## Key Algorithms

### Family Relationship Grouper
Located in `src/helpers/relationship-grouper.ts`.
- **Logic**: When constructing the visual tree, the backend fetches all graph edges. It categorizes relationships strictly:
  - `isParent(type)`: Father, Mother
  - `isSpouse(type)`: Husband, Wife
  - `isChild(type)`: Son, Daughter
  - `isSibling(type)`: Brother, Sister
- **Indirect Translation**: The grouper traverses edges. If A is Father to B, and B is Father to C, the grouper translates A's relationship to C as "Grandfather".

### AI Family Matcher Scoring
Located in `src/services/familyMatcherService.ts`.
- **Scoring Signals**: 
  - Exact Surname Match (+30 pts)
  - Exact Father Name Match (+40 pts)
  - Village Match (+15 pts)
  - Age/Gender validation checks (to prevent illogical parent-child matches).
- **Thresholds**: 
  - `> 90`: High Confidence.
  - `60 - 89`: Medium Confidence.
- **Creation**: Runs an `O(N^2)` check against orphaned users vs. existing family trees. Results are dumped to `tbl_ai_family_matches`.

### Gender-Aware Inverse Labels
Located in `src/helpers/relationship-translator.ts`.
- **Logic**: If User A adds User B as "Father". The system checks User A's gender. If A is Male, it creates an inverse edge: User B sees User A as "Son". If A is Female, User B sees User A as "Daughter".

---

## Code Patterns

### Adding a New Page
1. **Create Route File**: Create `index.tsx` in `src/routes/(app)/feature-name/`.
2. **Create API File**: Create `feature-api.ts` in `src/lib/`. Export an Axios object containing `get`, `post`, etc.
3. **Create UI Components**: Break down the page into components in `src/components/feature-name/`. Use Shadcn UI for base elements.
4. **Wire React Query**: Use `useQuery` for fetching and `useMutation` for writes inside `index.tsx`. Remember to call `queryClient.invalidateQueries` on mutation success.

### Common Patterns
- **Error Handling**: Use the `<ErrorState />` component if `isError` is true from `useQuery`.
- **Form Validation**: Create uncontrolled inputs bounded by standard React state (`useState`). Validate via custom boolean flags (e.g., `const isValid = name.trim() !== ''`).
- **Dialogs**: Utilize `Dialog`, `DialogContent`, `DialogHeader` from `@/components/ui/dialog`. Always control open/close state from the parent via props.

---

## Troubleshooting

### Common Issues
- **CORS Errors**: Ensure the backend `.env` allows requests from the specific `http://localhost:5173` or `3000` port your Vite server binds to.
- **Database Connection Reset**: Check MySQL service status. If using MySQL 8+, ensure the user was created using `mysql_native_password` if auth protocol errors appear.
- **JWT Token Invalid**: Verify the `JWT_SECRET` in `.env` is exactly the same as when the token was minted. Cleared by logging out and in again.
- **File Upload Failing**: Ensure the backend `/public/uploads/` folders exist. Multer crashes if the target directory is missing.

---

## Testing

### Manual Testing Checklist
Before merging PRs, ensure:
- [ ] Auth flows (Login/Logout) correctly assign/destroy tokens.
- [ ] CRUD operations (Create, Read, Update, Delete) trigger React Query cache invalidations.
- [ ] UI behaves correctly under Admin (is_community_admin=1) vs regular user states.
- [ ] Responsive layout doesn't break horizontally on 375px (Mobile viewport).
- [ ] Network throttling reveals proper Skeleton loaders.
