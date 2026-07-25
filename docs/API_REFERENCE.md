# API Reference

## Base URL
`http://localhost:4002`

## Authentication
All protected routes require a valid JWT token sent in the headers:
```http
Authorization: Bearer <jwt_token>
```

## Response Format
The API follows a standardized JSON response wrapper for all endpoints:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

---

## Endpoints

### 1. Authentication
Handles user onboarding, OTP generation, and token issuance.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/login/mobile` | No | Generate login OTP |
| POST | `/api/login/verify-otp` | No | Verify OTP and return JWT token |
| POST | `/api/register/mobile` | No | Send OTP for new registration |
| POST | `/api/register/verify-otp` | No | Verify OTP and create user account |

**Example Request (`/api/login/mobile`)**
```json
{
  "mobile_number": "9999900001"
}
```
**Example Response (`/api/login/verify-otp`)**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "eyJh...", "user": { "member_id": 1 } }
}
```

---

### 2. Family Graph
Core API for interactive relationship management.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/family-graph/me` | Yes | Get relationships for the logged-in user |
| GET | `/api/family-graph/member/:uuid` | Yes | Get relationships for a specific member |
| GET | `/api/family-graph/tree/:uuid` | Yes | Retrieve the hierarchical family tree map |
| POST | `/api/family-graph/relationship` | Yes | Add a manual relationship edge |
| GET | `/api/family-graph/pending` | Yes | Admin: Get pending manual relationships |
| PUT | `/api/family-graph/relationship/:uuid/approve` | Yes | Admin: Approve edge |
| PUT | `/api/family-graph/relationship/:uuid/reject` | Yes | Admin: Reject edge |
| DELETE | `/api/family-graph/relationship/:uuid` | Yes | Delete an existing relationship edge |

---

### 3. Family Matcher (AI Engine)
Endpoints interacting with the automated family grouping algorithm.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/family-matcher/scan` | Yes (Admin) | Trigger a new N^2 database scan |
| GET | `/api/family-matcher/suggestions` | Yes (Admin) | Get list of AI-generated matches |
| GET | `/api/family-matcher/stats` | Yes (Admin) | Get match success/pending statistics |
| PUT | `/api/family-matcher/suggestion/:uuid/approve` | Yes (Admin) | Approve an AI suggestion |
| PUT | `/api/family-matcher/suggestion/:uuid/reject` | Yes (Admin) | Reject an AI suggestion |

---

### 4. Family Join Requests
Handles manual requests by users to merge into an existing family ID.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/family-join/search?q=` | Yes | Search for existing families by surname/village |
| POST | `/api/family-join/request` | Yes | Submit a join request to a family head |
| GET | `/api/family-join/incoming` | Yes | Get requests targeting the logged-in user's family |
| GET | `/api/family-join/my-requests` | Yes | Get status of join requests sent by the logged-in user |
| GET | `/api/family-join/community` | Yes (Admin) | View all active join requests globally |
| PUT | `/api/family-join/request/:uuid/approve` | Yes | Approve the join request |
| PUT | `/api/family-join/request/:uuid/reject` | Yes | Reject with a provided reason |
| PUT | `/api/family-join/request/:uuid/cancel` | Yes | Cancel a self-initiated request |

---

### 5. Notice Board (News)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/news` | Yes | Retrieve paginated notices/events |
| GET | `/api/news/:uuid` | Yes | Get notice by ID |
| POST | `/api/news` | Yes (Admin) | Create new notice (`multipart/form-data`) |
| PUT | `/api/news/:uuid` | Yes (Admin) | Edit notice |
| DELETE | `/api/news/:uuid` | Yes (Admin) | Delete notice |

---

### 6. Members & Profiles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/user` | Yes | Get logged in user profile |
| PUT | `/api/user/:uuid` | Yes | Update profile (`multipart/form-data`) |
| GET | `/api/members-list/:family_uuid` | Yes | Get all details for a family |
| GET | `/api/unverified` | Yes (Admin) | Get new registrations pending verification |
| PUT | `/api/approve/:uuid` | Yes (Admin) | Approve user |
| PUT | `/api/reject/:uuid` | Yes (Admin) | Reject/Delete user |
| GET | `/api/surnames` | Yes | Get unique surname list for dropdowns |
| GET | `/api/representatives` | Yes | Get family heads |

---

### 7. Marksheets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/marksheets` | Yes | Get logged in user's marksheets |
| GET | `/api/all-marksheets` | Yes (Admin) | Get all marksheets submitted |
| POST | `/api/marksheets` | Yes | Upload a new marksheet |
| POST | `/api/process-marksheet` | Yes | Upload and run OCR processing (Experimental) |
| PUT | `/api/marksheets/approve/:id` | Yes (Admin) | Approve submission |
| PUT | `/api/marksheets/reject/:uuid` | Yes (Admin) | Reject with reason |
| PUT | `/api/marksheets/edit/:id` | Yes (Admin) | Modify standard/percentage data |
| DELETE| `/api/marksheets/:id` | Yes | Remove marksheet record |
| GET | `/api/award-eligible` | Yes (Admin) | Get users eligible for academic awards |

---

### 8. Photo Gallery
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/albums` | Yes | List all photo albums |
| POST | `/api/albums` | Yes (Admin) | Create a new photo album |
| DELETE| `/api/albums/:uuid` | Yes (Admin) | Delete an album |
| GET | `/api/photos/:album_uuid` | Yes | Get photos inside an album |
| POST | `/api/photos/:album_uuid` | Yes (Admin) | Bulk upload photos to album |

---

### 9. Business Directory
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/business` | Yes | List all businesses |
| POST | `/api/business` | Yes | Add new business |
| PUT | `/api/business/:uuid` | Yes | Edit business details |
| DELETE| `/api/business/:uuid` | Yes | Delete business |

---

### 10. Committee Members
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/committee` | Yes | List active committee members |
| POST | `/api/committee` | Yes (Admin) | Add user to committee |
| PUT | `/api/committee/:uuid` | Yes (Admin) | Edit role designation |
| DELETE| `/api/committee/:uuid` | Yes (Admin) | Remove from committee |

---

### 11. Donors
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/donors` | Yes | List all donors |
| POST | `/api/donors` | Yes (Admin) | Add external donor |
| POST | `/api/donors/:member_uuid` | Yes (Admin) | Convert member to donor |
| PUT | `/api/donors/:id` | Yes (Admin) | Edit donor details |
| DELETE| `/api/donors/:id` | Yes (Admin) | Delete donor |

---

### 12. Abroad Members
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/abroad` | Yes | List international members |
| GET | `/api/abroad/:uuid` | Yes | Get specific details |
| POST | `/api/abroad` | Yes (Admin) | Add member abroad |
| PUT | `/api/abroad/:uuid` | Yes (Admin) | Edit details |
| DELETE| `/api/abroad/:uuid` | Yes (Admin) | Delete abroad member |

---

### 13. Face Recognition (Experimental)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/face-recognition/album/:uuid`| Yes (Admin) | Trigger facial recognition scan on album |
| GET | `/api/selfies` | Yes | Get uploaded selfies |
| POST | `/api/selfie/upload` | Yes | Upload base selfies for recognition model |

---

### 14. Core Utilities
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/app-language` | No | Get supported localization languages |
| GET | `/api/app-version` | No | Get current client deployment version |
| GET | `/api/notifications` | Yes | Get logged-in user notifications |
| PUT | `/api/notifications/read/:id` | Yes | Mark notification as read |
| GET | `/api/community-numbers` | No | Get community helpline info |
| GET | `/api/dashboard-counts` | Yes | Get aggregation stats for dashboard tiles |

---
**Note**: To maintain system integrity, endpoints marked with `(Admin)` perform a secondary check against `req.user.is_community_admin` via middleware. Unauthorized requests will return `403 Forbidden`.
