# Community App - Admin Guide

Welcome to the **Admin Guide**. This document outlines the administrative features and responsibilities within the Community App. As an admin, you have access to tools necessary to maintain data integrity, moderate content, and manage users.

---

## Admin Overview
- **Exclusive Capabilities**: Admins can approve/reject users, manage the committee, moderate the business directory, add donors, approve marksheets, run AI Family Matcher scans, and post official notices.
- **Identifying Admins**: Admin users have a distinct "Admin" badge on their profile in the Members directory.
- **Responsibilities**: Keep the community safe, ensure family tree accuracy, process pending requests promptly, and moderate the notice board.

---

## Managing Members

### Approving New Members
- **Where to find them**: Check the Dashboard for a "Pending Approvals" alert or navigate to the User Verification section.
- **How to Approve/Reject**: Review the user's provided details. Click "Approve" to grant them access to the community. Click "Reject" if the profile is spam or invalid.
- **What happens after**: An approved user gains full access to view the Members directory, Family Tree, and other protected pages.

### Removing Members
- **How to remove**: From the Members Directory, an Admin can click the "Delete" icon on a user's profile card.
- **Data Deletion**: Removing a member deletes their authentication records, detaches them from the family graph, and removes their linked business/marksheet entries to maintain database integrity.

---

## AI Family Matcher
The AI Family Matcher automatically scans the database to find disconnected users who likely belong to the same family.

### Understanding AI Suggestions
- **What the AI looks for**: It analyzes Surnames, Father's Name, Village, Age gaps, and Contact Information.
- **Confidence Scores**: 
  - **High (90-100%)**: Extremely likely to be a match (e.g., exact surname, father's name, and phone match).
  - **Medium (60-89%)**: Probable match, requires human verification.
  - **Low (<60%)**: Weak correlation, mostly filtered out.

### Reviewing Suggestions
- **Accessing**: Click "AI Matches" from the Admin Dashboard.
- **Reading Cards**: Each suggestion card shows "User A" and "User B" alongside the "Why this suggestion?" section explaining the matched data points.
- **Approving**: Click "Approve". The system will automatically create the relationship edge in the Family Graph.
- **Rejecting**: Click "Reject". The suggestion is hidden permanently.

### Running New Scans
- **When to run**: Run a scan periodically (e.g., weekly) or after a large batch of new users register.
- **What happens**: The backend executes a scoring algorithm cross-referencing all unlinked users.
- **Results Interpretation**: New matches populate the suggestions list with updated confidence scores.

---

## Family Join Requests
Instead of the AI, sometimes users manually request to join a family via the "Find Family" tool.

### Reviewing Incoming Requests
- **Where to find**: Check the "Family Requests" section. Family Heads also see requests targeted at their specific family.
- **Information Shown**: The requester's name, profile, and the family they are trying to join.
- **Approving**: The member's `family_id` is merged with the target family. They become part of that family tree.
- **Rejecting**: You must provide a rejection reason (e.g., "Wrong family selected"). The user is notified and remains unlinked.

---

## Managing Notice Board

### Creating Notices
1. Navigate to **Notice Board** and click **+ Add Notice**.
2. **Types**: Select from News, Event, Meeting, or Death Notice.
3. **Details**: Add a descriptive Title and Description.
4. **Events**: If it's an Event or Meeting, you must provide the Date, Time, and Location.
5. **Photos**: Upload a relevant banner or photo.

### Editing/Deleting Notices
- **Edit**: Click the "Edit" pencil icon on your notice to update typos or change the date.
- **Delete**: Click the trash icon. A confirmation dialog will ensure you don't delete notices accidentally.

---

## Managing Committee

### Adding Committee Members
- Navigate to the **Committee** page and click **Add Member**.
- **Search**: Search the existing user database by name.
- **Assigning Role**: Select their role (President, Vice President, Secretary, Treasurer, Executive Member, etc.).
- **Hierarchy**: The page automatically sorts members by their rank in this hierarchy.

### Changing Roles & Removing
- **Update Designation**: Click the "Edit" icon on a committee member's card to promote or demote them.
- **Removing**: Click "Remove". A confirmation popup will appear. This only removes their committee status, not their community account.

---

## Managing Business Directory
### Moderating Listings
- Businesses uploaded by users immediately appear in the directory.
- Admins must actively monitor the directory. If a listing is inappropriate, spam, or violates community guidelines, the Admin can click the "Delete" icon on the business card to remove it permanently.

---

## Managing Donors
### Adding Donors
- Go to the **Donors** page and click **Add Donor**.
- **From Existing Members**: You can link the donation to a registered member's UUID.
- **External Donors**: You can manually type a name for offline/anonymous donors.
- **Lifetime Status**: Check the "Mark as Lifetime Donor" box for major contributors. They receive a special gold badge.

---

## Managing Abroad Members
### Adding/Removing
- Go to **Abroad Members** and click **Add Member**.
- Fill in their Name, Country, City, Career, and Contact info.
- Edit or Delete members when they relocate back home or their information becomes outdated.

---

## Managing Marksheets
### Reviewing Submissions
- Navigate to the **Marksheets** tab. Admins see an aggregated view of *all* student submissions.
- **Pending Marksheets**: Filter by "Pending". Review the uploaded document/PDF.
- **Approving**: Click the Checkmark. You can optionally assign a "Rank" (e.g., 1, 2, 3) for top performers.
- **Rejecting**: Click the X. A prompt will ask for a rejection reason (e.g., "Document blurry, please re-upload"), which the student will see.

---

## Managing Gallery
### Creating Albums
- Go to **Gallery** -> **New Album**.
- Provide an **Album Name** (e.g., Diwali Gathering) and **Year**. (The system will auto-generate a storage folder name).

### Uploading Photos
- Open the created Album.
- Click **Add Photos**.
- **Bulk Upload**: You can select multiple images (JPEG/PNG) at once. A progress indicator will show the upload status.

---

## Dashboard Badges
- **AI Matches Badge**: Red indicator showing the count of unresolved AI suggestions.
- **Family Requests Badge**: Red indicator showing pending manual join requests.
- **Notification Bell**: General system alerts requiring admin attention.

---

## Best Practices
1. **Regular AI Scans**: Run scans bi-weekly to ensure new members are integrated into the family tree quickly.
2. **Prompt Reviews**: Try to process User Registrations and Marksheet approvals within 48 hours to provide a smooth user experience.
3. **Data Accuracy**: Use your authority to edit incorrect profiles or remove duplicated businesses.
4. **Community Engagement**: Regularly post to the Notice Board to keep the application feeling active and alive.
