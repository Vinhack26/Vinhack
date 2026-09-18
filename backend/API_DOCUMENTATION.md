# BreachBuddy Backend API Documentation

**Project:** BreachBuddy  
**Base URL:** `http://localhost:5000/api`  
**Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## Response Formats

### Standard Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation description string",
  "data": {}
}
```

### Standard Error Response (`400`, `401`, `404`, `409`, `500`)
```json
{
  "success": false,
  "message": "User friendly error description",
  "error": {
    "code": "ERROR_CODE_IDENTIFIER",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/auth/register`
- **Auth Required:** No
- **Request Body:**
```json
{
  "name": "Security Lead Admin",
  "email": "demo@breachbuddy.org",
  "password": "Password123!"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Security Lead Admin",
      "email": "demo@breachbuddy.org",
      "created_at": "2026-09-18T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.2 User Login
- **Method:** `POST`
- **URL:** `/auth/login`
- **Auth Required:** No
- **Request Body:**
```json
{
  "email": "demo@breachbuddy.org",
  "password": "Password123!"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Security Lead Admin",
      "email": "demo@breachbuddy.org",
      "created_at": "2026-09-18T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

### 1.3 Get Current User Profile
- **Method:** `GET`
- **URL:** `/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "user": {
      "id": 1,
      "name": "Security Lead Admin",
      "email": "demo@breachbuddy.org",
      "created_at": "2026-09-18T10:00:00.000Z"
    }
  }
}
```

---

## 2. Incident Endpoints

### 2.1 Create Incident
- **Method:** `POST`
- **URL:** `/incidents`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "title": "College Student Database Exposure",
  "incidentType": "accidental_data_exposure",
  "description": "A college database misconfiguration left read access exposed.",
  "discoveryTime": "2026-09-18T10:00:00Z",
  "affectedSystem": "Student Database",
  "possibleDataExposed": [
    "names",
    "register_numbers",
    "email_addresses",
    "phone_numbers"
  ],
  "currentStatus": "suspected",
  "actionsAlreadyTaken": "Isolated port"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Incident created successfully",
  "data": {
    "incident": {
      "id": 1,
      "title": "College Student Database Exposure",
      "status": "suspected",
      "created_at": "2026-09-18T10:00:00.000Z"
    }
  }
}
```

### 2.2 Get All User Incidents
- **Method:** `GET`
- **URL:** `/incidents`
- **Auth Required:** Yes
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Incidents retrieved successfully",
  "data": {
    "incidents": [
      {
        "id": 1,
        "title": "College Student Database Exposure",
        "incident_type": "accidental_data_exposure",
        "affected_system": "Student Database",
        "current_status": "suspected",
        "discovery_time": "2026-09-18T10:00:00Z",
        "created_at": "2026-09-18T10:00:00Z"
      }
    ]
  }
}
```

### 2.3 Get Single Incident (Aggregated Details)
- **Method:** `GET`
- **URL:** `/incidents/:id`
- **Auth Required:** Yes
- **Response (`200 OK`):**
Returns the full incident record plus `aiReport`, `checklist`, `timeline`, `notificationDraft`, `notes`, and `evidence`.

### 2.4 Update Incident
- **Method:** `PATCH`
- **URL:** `/incidents/:id`
- **Auth Required:** Yes
- **Request Body (Partial):**
```json
{
  "currentStatus": "investigating",
  "actionsAlreadyTaken": "Rotated DB credentials and enabled firewall whitelist"
}
```

### 2.5 Delete Incident
- **Method:** `DELETE`
- **URL:** `/incidents/:id`
- **Auth Required:** Yes
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Incident deleted successfully",
  "data": { "id": 1 }
}
```

### 2.6 AI Incident Analysis
- **Method:** `POST`
- **URL:** `/incidents/:id/analyze`
- **Auth Required:** Yes
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "AI Analysis completed successfully",
  "data": {
    "summary": "Initial triage for College Student Database Exposure...",
    "dataCategories": [
      {
        "category": "contact_information",
        "items": ["email addresses", "phone numbers"],
        "status": "potentially_exposed"
      }
    ],
    "possibleImpact": [
      {
        "impact": "targeted_phishing",
        "reason": "Exposed contact info could be used for social engineering.",
        "severity": "medium"
      }
    ],
    "missingInformation": [
      {
        "question": "Were firewall logs retained?",
        "reason": "To verify exfiltration volume."
      }
    ],
    "confirmedFacts": ["Database port 5432 was unauthenticated."],
    "userAssumptions": ["Exposure was limited to local subnet."],
    "aiInterpretations": ["Initial operational assessment; not legal advice."],
    "checklist": [
      {
        "task": "Preserve firewall and flow logs",
        "category": "investigation",
        "priority": "high"
      }
    ],
    "notificationDraft": {
      "subject": "[Security Notice] Suspected Exposure Advisory",
      "body": "Dear Affected Stakeholders..."
    }
  }
}
```

---

## 3. Action Checklist Endpoints

### 3.1 Get Checklist Tasks & Completion Stats
- **Method:** `GET`
- **URL:** `/incidents/:id/checklist?category=containment` *(category optional)*
- **Auth Required:** Yes
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Checklist tasks retrieved",
  "data": {
    "tasks": [
      {
        "id": 1,
        "incident_id": 1,
        "task": "Preserve logs",
        "category": "investigation",
        "priority": "high",
        "status": "completed",
        "completed_at": "2026-09-18T10:30:00Z"
      }
    ],
    "progress": {
      "total": 4,
      "completed": 1,
      "inProgress": 1,
      "pending": 2,
      "percentage": 25
    }
  }
}
```

### 3.2 Create Checklist Task
- **Method:** `POST`
- **URL:** `/incidents/:id/checklist`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "task": "Audit administrative DB credentials",
  "category": "recovery",
  "priority": "high"
}
```

### 3.3 Update Checklist Task Status/Priority
- **Method:** `PATCH`
- **URL:** `/checklist/:taskId`
- **Auth Required:** Yes
- **Request Body:**
```json
{
  "status": "completed",
  "priority": "high"
}
```

### 3.4 Delete Checklist Task
- **Method:** `DELETE`
- **URL:** `/checklist/:taskId`

---

## 4. Timeline Endpoints

### 4.1 Get Timeline Events
- **Method:** `GET`
- **URL:** `/incidents/:id/timeline`

### 4.2 Create Timeline Event
- **Method:** `POST`
- **URL:** `/incidents/:id/timeline`
- **Request Body:**
```json
{
  "eventTitle": "Network Port Blocked",
  "description": "Port 5432 ingress blocked at firewall perimeter.",
  "eventTime": "2026-09-18T10:15:00Z",
  "eventType": "containment"
}
```

### 4.3 Update Timeline Event
- **Method:** `PATCH`
- **URL:** `/timeline/:eventId`

### 4.4 Delete Timeline Event
- **Method:** `DELETE`
- **URL:** `/timeline/:eventId`

---

## 5. Notification Draft Endpoints

### 5.1 Generate Notification Draft
- **Method:** `POST`
- **URL:** `/incidents/:id/notification/generate`

### 5.2 Get Notification Draft
- **Method:** `GET`
- **URL:** `/incidents/:id/notification`

### 5.3 Edit Notification Draft
- **Method:** `PATCH`
- **URL:** `/incidents/:id/notification`
- **Request Body:**
```json
{
  "subject": "[Updated Notice] Student Portal Security Advisory",
  "body": "Updated email body text..."
}
```

---

## 6. Notes & Evidence Endpoints

### 6.1 Notes
- `GET /incidents/:id/notes`: List notes
- `POST /incidents/:id/notes`: Add note (`{ "title": "Log review", "content": "No exfiltration found", "logReference": "syslog-1" }`)
- `PATCH /notes/:noteId`: Edit note
- `DELETE /notes/:noteId`: Delete note

### 6.2 Evidence References
- `GET /incidents/:id/evidence`: List evidence
- `POST /incidents/:id/evidence`: Add evidence (`{ "title": "PCAP Capture", "referenceType": "log_reference", "referenceValue": "cap-2026.pcap" }`)
- `DELETE /evidence/:evidenceId`: Delete evidence

---

## 7. Download PDF Incident Report

- **Method:** `GET`
- **URL:** `/incidents/:id/report/pdf`
- **Auth Required:** Yes
- **Response:** File Stream (`Content-Type: application/pdf`, `Content-Disposition: attachment; filename="incident-report-#id.pdf"`)
