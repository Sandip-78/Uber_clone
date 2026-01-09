# Users API — Auth Endpoints 🔐

A concise, developer-friendly reference for authentication-related endpoints under `backend/`.

---

## Table of contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Register — POST /users/register](#register---post-usersregister)
  - [Login — POST /users/login](#login---post-userslogin)
  - [Profile — GET /users/profile](#profile---get-usersprofile)
  - [Logout — GET /users/logout](#logout---get-userslogout)
- [Token blacklist (short)](#token-blacklist-short)
- [Implementation notes](#implementation-notes)
- [Examples](#examples)

---

## Overview

This document covers the user authentication endpoints implemented in the project. Each endpoint is documented with: Method, Path, Authentication requirement, Request/Response examples, and possible status codes.

---

## Authentication

- JWTs are used for authentication. Tokens are issued on successful login/register and should be sent as:
  - `Authorization: Bearer <token>` header OR
  - `token` cookie (the code supports clearing this cookie on logout)
- Keep the environment variable `JWT_SECRET_KEY` set for signing tokens.

---

## Endpoints

### Register — POST /users/register

- Method: POST
- Path: `/users/register`
- Auth: No
- Description: Create a new user account. Passwords are hashed before persisting.

Request:
- Headers: `Content-Type: application/json`
- Body schema:
  - `fullName.firstName` (string, required, min 3)
  - `fullName.lastName` (string, optional)
  - `email` (string, required, email)
  - `password` (string, required, min 6)

Responses:
- 201 Created — returns `{ user, token }` (password excluded)
- 400 Bad Request — missing fields `{ message: "All fields are required." }`
- 422 Unprocessable Entity — validation errors `{ errors: [ ... ] }`
- 500 Internal Server Error — `{ message: "Internal Server Error" }`

Example success response:

```json
{
  "user": {
    "_id": "60f7a0b7c2a2b84f394a1cd4",
    "fullName": { "firstName": "Jane", "lastName": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null,
    "__v": 0
  },
  "token": "<JWT_TOKEN_HERE>"
}
```

---

### Login — POST /users/login

- Method: POST
- Path: `/users/login`
- Auth: No
- Description: Authenticate a user and return `{ user, token }`.

Request:
- Headers: `Content-Type: application/json`
- Body schema:
  - `email` (string, required, email)
  - `password` (string, required)

Responses:
- 200 OK — `{ user, token }`
- 400 Bad Request — invalid credentials `{ message: "Invalid email or password." }`
- 422 Unprocessable Entity — validation errors
- 500 Internal Server Error

Example success response: see Register success example above (same shape).

---

### Profile — GET /users/profile

- Method: GET
- Path: `/users/profile`
- Auth: Yes (JWT)
- Description: Returns the authenticated user's profile (`req.user` is attached by `authMiddleware`).

Responses:
- 200 OK — `{ user }`
- 401 Unauthorized — missing/invalid token `{ message: "Access denied. No token provided." }`

Example response:

```json
{
  "user": {
    "_id": "60f7a0b7c2a2b84f394a1cd4",
    "fullName": { "firstName": "Jane", "lastName": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

---

### Logout — GET /users/logout

- Method: GET
- Path: `/users/logout`
- Auth: Yes (JWT)
- Description: Logs out the user, clears the token cookie (if set), and stores the token in the blacklist so it cannot be reused.

Responses:
- 200 OK — `{ message: "Logged out successfully" }`
- 401 Unauthorized — `{ message: "Access denied. No token provided." }`

---

### Captains — POST /captains/register

- Method: POST
- Path: `/captains/register`
- Auth: No
- Description: Create a new captain account (drivers). The captain model includes vehicle details and optional location/status fields.

Request:
- Headers: `Content-Type: application/json`
- Body schema:
  - `fullName.firstName` (string, required, min 3)
  - `fullName.lastName` (string, optional)
  - `email` (string, required, email, **unique**)
  - `password` (string, required, min 6)
  - `vehical.color` (string, required)
  - `vehical.plateNo` (string, required, min 3)
  - `vehical.capacity` (number, required, min 1)
  - `vehical.vehicalType` (enum: `auto|bike|activa|car`, required)
  - `location` (object with `lat`, `lng` — optional)
  - `status` (optional, enum: `available|unavailable|on-trip`)

Responses:
- 201 Created — returns `{ captain, token }` (password excluded)
- 400 Bad Request — missing fields or already registered `{ message: "Captain is already registered" }`
- 422 Unprocessable Entity — validation errors `{ errors: [ ... ] }`
- 500 Internal Server Error — `{ message: "Internal Server Error" }`

Example success response:

```json
{
  "captain": {
    "_id": "60f7a1c3e2b5a02d5c4d2f9b",
    "fullName": { "firstName": "John", "lastName": "Smith" },
    "email": "john.smith@example.com",
    "vehical": { "color": "white", "plateNo": "ABC123", "capacity": 4, "vehicalType": "car" },
    "socketId": null,
    "status": null,
    "__v": 0
  },
  "token": "<JWT_TOKEN_HERE>"
}
```

Notes:
- The `email` field in `captain.Model.js` has `unique: true` and a regex `match` validator.
- Passwords are hashed using `captainModel.hashPassword` before saving.
- The instance method is named `comaprePassword` (typo) — consider renaming to `comparePassword` for consistency.


## Token blacklist (short)

- Purpose: Blacklist stores tokens that should not be accepted even if they are otherwise valid (e.g., after logout).
- Implementation: Tokens are stored in `BlackList` collection. The schema uses a TTL (`expires`) so entries auto-remove after the configured time.
- Note: `createddAt` in `blackListModel.js` is misspelled; consider renaming it to `createdAt`.

---

## Implementation notes

- Routes: `backend/routes/user.routes.js`
- Controller: `backend/controllers/user.controller.js`
- Models: `backend/models/user_model.js`, `backend/models/blackListModel.js`
- Validators use `express-validator` for request validation.
- Passwords: hashed via `bcrypt` using `userModel.hashPassword`.
- Tokens: signed with `JWT_SECRET_KEY`, expire in 7 days (`user.generateAuthToken`).

---

## Examples

Register (curl):

```bash
curl -X POST http://localhost:3000/users/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":{"firstName":"Jane","lastName":"Doe"},"email":"jane.doe@example.com","password":"secret123"}'
```

Login (curl):

```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane.doe@example.com","password":"secret123"}'
```

Profile (curl with header):

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/users/profile
```

Logout (curl with header):

```bash
curl -H "Authorization: Bearer <JWT_TOKEN>" http://localhost:3000/users/logout
```

---


## Users API — GET /users/profile ✅

**Path:** `GET /users/profile`

**Description:**
Returns the authenticated user's profile. Requires a valid JWT (sent as `Authorization: Bearer <token>` header or cookie).

---

## Request

- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` or a cookie containing `token`

## Responses

### Success — 200 OK ✅

- **Example response:**

```json
{
  "user": {
    "_id": "60f7a0b7c2a2b84f394a1cd4",
    "fullName": { "firstName": "Jane", "lastName": "Doe" },
    "email": "jane.doe@example.com",
    "socketId": null,
    "__v": 0
  }
}
```

### Unauthorized — 401 Unauthorized ❗

- **Example:**

```json
{ "message": "Access denied. No token provided." }
```

Notes:
- The route uses `authMiddleware` to verify the JWT and attach `req.user`.
- Tokens present in the blacklist are considered invalid (see below).

---

## Users API — GET /users/logout ✅

**Path:** `GET /users/logout`

**Description:**
Logs out the current user by clearing the auth cookie and adding the active token to a blacklist so it cannot be used again.

---

## Request

- **Headers:**
  - `Authorization: Bearer <JWT_TOKEN>` or a cookie containing `token`

## Responses

### Success — 200 OK ✅

- **Example:**

```json
{ "message": "Logged out successfully" }
```

### Unauthorized — 401 Unauthorized ❗

- **Example:**

```json
{ "message": "Access denied. No token provided." }
```

Notes:
- The controller clears the cookie (if set) and stores the token string in the `BlackList` collection to prevent reuse.

---

## Token blacklist — short explanation 🔒

- Purpose: to invalidate JWTs after logout so a previously issued token cannot be reused to access protected routes.
- Implementation: tokens are stored as plain strings in `backend/models/blackListModel.js` and the schema uses a TTL index (`expires`) so entries auto-expire after the configured time (currently `86400` seconds in the schema).
- Tip: the schema field `createddAt` appears misspelled — consider renaming to `createdAt` for clarity and consistency.

---


