# Frontend to Backend Handoff

## Environment
- `VITE_API_BASE_URL`: backend origin (example: `http://localhost:3000`)
- `VITE_ENABLE_MOCKS`: `true` for local mock mode, `false` to enforce real API calls

## Auth Expectations
- Login endpoint: `POST /api/auth/login`
- Request body: `{ "email": "string", "password": "string" }`
- Response body: `{ "accessToken": "string", "user": { "name": "string", "role": "admin" } }`
- Frontend sends bearer token in `Authorization` header.

## Bootstrap Contract
- Endpoint: `GET /api/admin/bootstrap`
- Response shape:
  - `faculty: Faculty[]`
  - `students: Student[]`
  - `subjects: Subject[]`
  - `timeLogs: TimeLog[]`
  - `attendance: AttendanceRecord[]`

## CRUD Endpoints in Use
- `POST /api/faculty`
- `POST /api/students`
- `POST /api/subjects`
- `PATCH /api/subjects/:id`
- `DELETE /api/subjects/:id`
- `POST /api/time-logs`
- `POST /api/attendance`

## Error Format
Frontend expects this error shape for non-2xx responses:

```json
{
  "message": "string",
  "code": "OPTIONAL_CODE"
}
```

## Required DTO fields
- `Faculty`: `id`, `name`, `email`, `phone`, `address`, `educationLevel`, `hourlyRate`, `subjects`, `hasProfilePic`, `hasTOR`, `hasDiploma`
- `Student`: `id`, `name`, `email`, `phone`, `address`, `gradeLevel`, `subjects`
- `Subject`: `id`, `code`, `name`, `description`, `days`, `startTime`, `endTime`, `gradeLevel`, `facultyId`
- `TimeLog`: `id`, `date`, `time`, `facultyId`, `facultyName`, `subject`, `grade`, `hours`, `hourlyRate`, `isOvertime`, `hasTOR`, `hasDiploma`
- `AttendanceRecord`: `id`, `studentId`, `studentName`, `date`, `time`, `subject`, `status`

## Validation / Behavior Notes
- Passwords are not persisted in frontend domain state.
- Payroll period fields (`periodStart`, `periodEnd`, `periodLabel`) are auto-computed client-side when missing.
- Subject updates are partial patch operations.
