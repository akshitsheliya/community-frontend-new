# Backend API Reference

## Base URL
http://localhost:4002

## Authentication
All protected routes need: `Authorization: Bearer <token>`

## API Endpoints

### 🔐 Auth & Profile Module
Route files: `authRoutes.ts`, `updateProfileRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/register/mobile` | No | Send registration OTP |
| POST | `/api/register/verify-otp` | No | Verify registration OTP |
| POST | `/api/login/mobile` | No | Send login OTP |
| POST | `/api/login/verify-otp` | No | Verify login OTP |
| POST | `/api/delete-account` | No | Request account deletion |
| POST | `/api/profile` | Yes | Create user profile (multipart) |
| GET | `/api/user` | Yes | Get logged-in user data |
| PUT | `/api/user/:member_uuid` | Yes | Update logged-in user data |

### 👥 User Verification & Management (Admin)
Route file: `userVerificationRoutes.ts`, `deleteMemberRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/unverified` | Yes (Admin) | Get unverified users |
| PUT | `/api/approve/:member_uuid` | Yes (Admin) | Approve user |
| PUT | `/api/reject/:member_uuid` | Yes (Admin) | Reject user |
| DELETE | `/api/user` | Yes | Delete logged in user |
| DELETE | `/api/member/:member_uuid` | Yes | Delete member by UUID |

### 🏘️ Community & Surname Module
Route file: `communityNumberRoutes.ts`, `surnameRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/community` | No | Get all/specific community |
| POST | `/api/auth/change-community` | Yes | Change user community |
| GET | `/api/surname` | Yes | Get surnames list |

### 👨‍👩‍👧‍👦 Family Module
Route files: `familyRoutes.ts`, `familyRepresentativeRoutes.ts`, `memberlistRoutes.ts`, `familyMemberRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/families` | Yes | Get family details |
| GET | `/api/representatives` | Yes | Get family representatives |
| GET | `/api/members-list/:family_uuid` | Yes | Get family member details |
| POST | `/api/members` | Yes | Add family member (from memberlistRoutes.ts / familyMemberRoutes) |

### 📊 Counts/Stats Module
Route file: `countRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/counts` | Yes | Get dashboard counts/stats |

### 🌍 Abroad Member Module
Route file: `abroadMemberRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/abroad` | Yes | Get all abroad members |
| GET | `/api/abroad/:abroad_uuid` | Yes | Get specific abroad member |
| POST | `/api/abroad` | Yes | Add abroad member |
| PUT | `/api/abroad/:abroad_uuid` | Yes | Update abroad member |
| DELETE | `/api/abroad/:abroad_uuid` | Yes | Delete abroad member |

### 🖼️ Photo & Face Gallery Module
Route files: `albumGalleryRoutes.ts`, `photoGalleryRoutes.ts`, `faceRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/albums` | Yes | Get photo albums |
| POST | `/api/albums` | Yes | Create photo album |
| DELETE | `/api/albums/:album_uuid` | Yes | Delete photo album |
| PUT | `/api/albums/:album_uuid` | Yes | Update photo album |
| GET | `/api/photos/:album_uuid` | Yes | Get photos from album |
| POST | `/api/photos/:album_uuid` | Yes | Upload photos |
| POST | `/api/face-recognition/album/:album_uuid` | Yes (Admin) | Trigger face recognition |
| POST | `/api/selfie/upload` | Yes | Upload selfies for match |
| GET | `/api/selfies` | Yes | Get user selfies |
| GET | `/api/selfie/:selfie_uuid/album/:album_uuid` | Yes | Get matched selfie photos |
| DELETE | `/api/selfie/:selfie_uuid` | Yes | Delete selfie |
| POST | `/api/face/process-selfie` | No | Process next selfie |

### 🎓 Marksheet & Award Module
Route files: `marksheetRoutes.ts`, `awardEligibleRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/marksheets` | Yes | Get user marksheets |
| POST | `/api/marksheets` | Yes | Store marksheet |
| POST | `/api/process-marksheet` | Yes | Upload and process marksheet |
| GET | `/api/all-marksheets` | Yes (Admin) | Get all marksheets |
| PUT | `/api/marksheets/approve/:id` | Yes (Admin) | Approve marksheet |
| PUT | `/api/marksheets/reject/:marksheet_uuid` | Yes (Admin) | Reject marksheet |
| PUT | `/api/marksheets/edit/:id` | Yes (Admin) | Edit marksheet |
| DELETE | `/api/marksheets/:id` | Yes | Delete marksheet |
| GET | `/api/award-eligible` | Yes | Get award eligible students |
| GET | `/api/generate-pdf` | Yes | Generate Top 5 PDF |

### 💼 Business Module
Route file: `businessRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/business` | Yes | Get all businesses |
| GET | `/api/business/:business_uuid` | Yes | Get business by UUID |
| POST | `/api/business` | Yes | Add business |
| PUT | `/api/business/:business_uuid` | Yes | Update business |
| DELETE | `/api/business/:business_uuid` | Yes | Delete business |
| GET | `/api/business-categories` | Yes | Get business categories |

### 👔 Committee Module
Route file: `committeeMemberRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/committee` | Yes | Get committee members |
| PUT | `/api/committee/:member_uuid` | Yes | Add committee member |
| PUT | `/api/edit-committee/:member_uuid` | Yes | Edit committee member |
| DELETE | `/api/committee/:member_uuid` | Yes | Delete committee member |

### 💝 Donors Module
Route file: `donorsRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/members` | Yes | Get all members for donor list |
| GET | `/api/donors` | Yes | Get all donors |
| POST | `/api/donors` | Yes | Create donor |
| POST | `/api/donors/:member_uuid` | Yes | Create donor from member |
| PUT | `/api/donors/:donor_id` | Yes | Update donor |
| DELETE | `/api/donors/:donor_id` | Yes | Delete donor |

### 📰 News Module
Route file: `newsRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/news` | Yes | Get all news feeds |
| GET | `/api/news/:newsUuid` | Yes | Get specific news by UUID |
| POST | `/api/news` | Yes (Admin) | Create news |
| PUT | `/api/news/:newsUuid` | Yes | Update news |
| DELETE | `/api/news/:newsUuid` | Yes | Delete news by UUID |

### 🔔 Notification & Settings Module
Route files: `appNotificationRoutes.ts`, `appLanguageRoutes.ts`, `appVersionRoutes.ts`

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/notification` | Yes | Get notifications |
| PUT | `/api/notification` | Yes | Mark notifications as read/update |
| PUT | `/api/language` | Yes | Update app language |
| GET | `/api/version` | Yes | Get app version |

---

## APIs USED BY OLD FRONTEND

From scanning `src/Api/` in the old frontend, these endpoints are actively consumed by the UI:

- **abroadmember.ts**: `GET /abroad`, `GET /abroad/:uuid`, `POST /abroad`, `PUT /abroad/:uuid`, `DELETE /abroad/:uuid`
- **Album.ts / MyPhoto.ts**: `GET /albums`, `POST /photos/:uuid`, `DELETE /albums/:uuid`, `POST /face-recognition...`, `GET /selfies`, `POST /selfie/upload`, `GET /selfie/...`
- **allMarkSheet.ts / Marksheet.ts**: `GET /all-marksheets`, `GET /marksheets`, `POST /process-marksheet`, `DELETE /marksheets/:uuid`
- **AwardStudents.ts**: `GET /award-eligible`, `GET /generate-pdf`
- **Business.ts**: `GET /business`, `GET /business/:uuid`, `POST /business`, `PUT /business/:uuid`, `DELETE /business/:uuid`, `GET /business-categories`
- **committee-members.ts**: `GET /committee`, `DELETE /committee/:uuid`
- **Community.ts**: `GET /community`
- **counts.ts**: `GET /counts?year=...`
- **delete-account-users.ts**: `DELETE /user`
- **Donor.ts**: `GET /donors`, `GET /members`, `POST /donors/:uuid`, `POST /donors`, `PUT /donors/:id`, `DELETE /donors/:id`
- **family-members.ts / familyRepresentative.ts / memberLlist.ts**: `GET /members-list/:family_uuid`, `DELETE /member/:uuid`, `GET /representatives`, `GET /families`, `POST /members`
- **News.ts**: `GET /news`, `POST /news`, `GET /news/:uuid`, `PUT /news/:uuid`, `DELETE /news/:uuid`
- **notification.ts**: `GET /notification`, `PUT /notification`
- **profileService.ts / user.ts**: `POST /profile`, `PUT /user/:id`, `GET /user`, `GET /unverified`, `PUT /approve/:id`
- **surname.ts**: `GET /surname`
