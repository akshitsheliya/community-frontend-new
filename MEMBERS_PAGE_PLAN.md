# Members List Page - Implementation Plan

## Available APIs (from backend)
Based on the backend analysis, the following endpoints are related to Members:

1. **`GET /api/families`**
   - **Purpose:** Fetches all family details. Often used as the base to get a list of families/members grouped by family.
2. **`GET /api/members-list/:family_uuid`**
   - **Purpose:** Fetches the detailed list of members for a specific family.
3. **`GET /api/representatives`**
   - **Purpose:** Gets a list of family representatives (heads of families).
4. **`POST /api/members`**
   - **Purpose:** Adds a new family member to the community.
5. **`DELETE /api/member/:member_uuid`**
   - **Purpose:** Deletes a specific member by their UUID.
6. **`GET /api/members`** (under Donors module, but gets all members)
   - **Purpose:** Might fetch a flat list of all members, useful for search/dropdowns.

## Data Structure
While the exact response structure depends on the API, a typical `Member` object in this application contains:
- `member_uuid` (string, unique identifier)
- `first_name` (string)
- `surname` (string)
- `phone_number` (string)
- `profile_photo` (string/URL)
- `family_uuid` (string, links them to a family)
- `is_representative` / `role` (boolean/string, identifies family head or committee)

## Filters Available
Based on the API structure, we can implement the following filters:
- **All Members**: Showing all available members.
- **Family Representatives**: Using the `/api/representatives` endpoint to show only heads of families.
- **By Family**: Using the `/api/families` to list families, and drilling down into `/api/members-list/:family_uuid`.

## Recommended Frontend Approach

### Page Route
`/members`

### Page Layout
- **Header:** Sticky top header with a back button and "Members" title.
- **Search Bar:** A prominent search input at the top to search by name or phone number (client-side filtering if fetching all, or server-side if supported).
- **Filter Chips:** A horizontally scrollable row of chips just below the search bar:
  - "All"
  - "Family Heads"
  - "Committee"
- **Member List:** A mobile-first, vertical list of member cards.
- **Member Card Design:**
  - Avatar on the left (rounded, fallback to user icon).
  - Name and Surname (bold).
  - Phone number (subtle text).
  - Small badge indicating "Head" or "Committee" if applicable.
  - Action button (e.g., "View") on the right.

### Mobile-First Design
- **Card Layout:** Use a list of cards instead of a traditional data table, making it touch-friendly.
- **Infinite Scroll / Load More:** If the API supports pagination, implement an intersection observer to load more members as the user scrolls.
- **Modal/Drawer:** Tapping a member card should slide up a Drawer (bottom sheet) or navigate to a detailed view showing their full family structure and details.
- **Design Language:** Match the Dashboard—use `#A32328` for primary accents, clean white backgrounds with subtle gray borders, and Lucide React icons.

### API Calls Needed
To populate the page, we will need:
- `GET /api/families` or `GET /api/members` (depending on the default view, whether grouped by family or flat list).
- `GET /api/representatives` when the "Family Heads" filter is active.
- `GET /api/members-list/:family_uuid` when viewing a specific family's details.
