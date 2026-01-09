# Backend API — Authentication 🔐

A concise, developer-facing reference for authentication and captain (driver) endpoints.

---

## Table of contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Users](#users)
    - [Register — POST /users/register](#register----post-usersregister)
    - [Login — POST /users/login](#login----post-userslogin)
    - [Profile — GET /users/profile](#profile----get-usersprofile)
    - [Logout — GET /users/logout](#logout----get-userslogout)
  - [Captains](#captains)
    - [Register — POST /captains/register](#register----post-captainsregister)
    - [Login — POST /captains/login](#login----post-captainslogin)
    - [Profile — GET /captains/profile](#profile----get-captainsprofile)
    - [Logout — GET /captains/logout](#logout----get-captainslogout)
- [Token blacklist (short)](#token-blacklist-short)
- [Implementation notes & TODOs](#implementation-notes--todos)
- [Examples](#examples)

---

## Overview

This document describes the authentication flows for Users and Captains in the backend. It lists method, path, auth requirements, request/response examples, and common errors.

---

## Authentication

- JWTs are used for authentication.
- Tokens can be sent as:
  - `Authorization: Bearer <token>` header
  - `token` cookie (login endpoints set a cookie)
- Environment: set `JWT_SECRET_KEY` for signing tokens.
- Note: token lifetimes differ by model (see notes below).

---

## Endpoints

## Users

### Register — POST /users/register
- Method: POST
- Path: `/users/register`
- Auth: No
- Description: Create a new user account. Passwords are hashed before storage.

Request
- Headers: `Content-Type: application/json`
- Body:
  - `fullName.firstName` (string, required, min 3)
  - `fullName.lastName` (string, optional)
  - `email` (string, required, email)
  - `password` (string, required, min 6)

Responses
- 201 Created — `{ user, token }` (password excluded)
- 400 Bad Request — `{ message: "All fields are required." }`
- 422 Unprocessable Entity — `{ errors: [...] }`
- 500 Internal Server Error

Notes
- User tokens expire in 24 hours (see `user_model.generateAuthToken`).

---

### Login — POST /users/login
- Method: POST
- Path: `/users/login`
- Auth: No
- Description: Authenticate a user; returns `{ user, token }` and sets a cookie.

Request
- Headers: `Content-Type: application/json`
- Body: `{ email, password }`

Responses
- 200 OK — `{ user, token }`
- 400 Bad Request — invalid credentials `{ message: "Invalid email or password." }`
- 422 Unprocessable Entity — validation errors
- 500 Internal Server Error

---

### Profile — GET /users/profile
- Method: GET
- Path: `/users/profile`
- Auth: Yes (JWT)
- Description: Returns the authenticated user's profile (attached as `req.user`).

Responses
- 200 OK — `{ user }`
- 401 Unauthorized — `{ message: "Access denied. No token provided." }`

---

### Logout — GET /users/logout
- Method: GET
- Path: `/users/logout`
- Auth: Yes (JWT)
- Description: Clears auth cookie and blacklists the token.

Responses
- 200 OK — `{ message: "Logged out successfully" }`
- 401 Unauthorized — `{ message: "Access denied. No token provided." }`

---

## Captains

### Register — POST /captains/register
- Method: POST
- Path: `/captains/register`
- Auth: No
- Description: Create a captain (driver) account. Includes vehicle details.

Request
- Headers: `Content-Type: application/json`
- Body:
  - `fullName.firstName` (string, required, min 3)
  - `fullName.lastName` (string, optional)
  - `email` (string, required, email, unique)
  - `password` (string, required, min 6)
  - `vehical.color` (string, required)
  - `vehical.plateNo` (string, required, min 3)
  - `vehical.capacity` (number, required, min 1)
  - `vehical.vehicalType` (enum: `auto|bike|activa|car`, required)
  - `location` (optional; `{ lat, lng }`)
  - `status` (optional; enum `available|unavailable|on-trip`)

Responses
- 201 Created — `{ captain, token }` (password excluded)
- 400 Bad Request — missing fields / already registered
- 422 Unprocessable Entity — `{ errors: [...] }`
- 500 Internal Server Error

Notes
- Captain tokens expire in 7 days (see `captain.Model.generateAuthToken`).
- `email` has `unique: true` and a regex validator in `captain.Model.js`.
- There is a typo in the model method name `comaprePassword` — consider renaming to `comparePassword`.

---

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


