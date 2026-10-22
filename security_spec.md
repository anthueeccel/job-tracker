# JobTracker Pro - Security Specification & Access Control

## 1. Data Invariants
1. **User Identity Boundary**: Every document under `/users/{userId}` and its subcollections belongs strictly to `request.auth.uid == userId`.
2. **User Document Ownership**: A user document at `/users/{userId}` cannot be read, created, updated, or deleted by anyone other than the authenticated user whose `request.auth.uid == userId`.
3. **Job Application Scoping**: A job application at `/users/{userId}/jobs/{jobId}` can only be read, created, updated, or deleted by the authenticated owner (`request.auth.uid == userId` and `incoming().userId == request.auth.uid`).
4. **Field Type & Length Integrity**: All string fields must adhere to strict volumetric limits (e.g. title <= 200 chars, company <= 150 chars, max length guards on notes, arrays, and URLs).
5. **No Anonymous Or Unverified Write Access**: Writes require `request.auth != null && request.auth.token.email_verified == true`.
6. **No Shadow Fields**: Strict schema keys on creation (`hasAll` for required keys, `hasOnly` for permitted keys).
7. **Id Poisoning Prevention**: Document IDs `{userId}` and `{jobId}` must be valid IDs (`isValidId` matching `^[a-zA-Z0-9_\-]+$` and size <= 128).

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1: Unauthenticated Read / Write**
   - Attempt: Reading or creating a job without authentication (`request.auth == null`).
   - Expected Result: `PERMISSION_DENIED`.

2. **Payload 2: Cross-User Read (Attacker reading victim's pipeline)**
   - Attempt: Auth user `attacker123` attempts `get` or `list` on `/users/victim456/jobs`.
   - Expected Result: `PERMISSION_DENIED`.

3. **Payload 3: Cross-User Write (Attacker injecting a job into victim's account)**
   - Attempt: Auth user `attacker123` attempts `create` on `/users/victim456/jobs/job-01` with `userId: "victim456"`.
   - Expected Result: `PERMISSION_DENIED`.

4. **Payload 4: Identity Spoofing (Forged owner UID)**
   - Attempt: Auth user `attacker123` attempts `create` on `/users/attacker123/jobs/job-01` with `userId: "victim456"`.
   - Expected Result: `PERMISSION_DENIED`.

5. **Payload 5: ID Poisoning (1KB junk ID injection)**
   - Attempt: Writing to `/users/attacker123/jobs/` with an ID of 2,000 special characters or path traversal elements.
   - Expected Result: `PERMISSION_DENIED`.

6. **Payload 6: Shadow Field Injection (Privilege or schema escalation)**
   - Attempt: Including unexpected hidden field `isAdmin: true` or `superRole: "root"` on `/users/{userId}/jobs/{jobId}`.
   - Expected Result: `PERMISSION_DENIED`.

7. **Payload 7: Denial of Wallet via 20MB String Payload**
   - Attempt: Writing `title: "A".repeat(500000)` into `title` field.
   - Expected Result: `PERMISSION_DENIED`.

8. **Payload 8: Array Explosion Attack**
   - Attempt: Writing a `stages` array with 50,000 nested items.
   - Expected Result: `PERMISSION_DENIED` (enforcing `.size() <= 50`).

9. **Payload 9: Unverified Email Write Attack**
   - Attempt: User with `request.auth.token.email_verified == false` attempting to write records.
   - Expected Result: `PERMISSION_DENIED`.

10. **Payload 10: Modifying Immutable Owner ID on Update**
    - Attempt: Updating an existing job and changing `userId` from `attacker123` to `victim456`.
    - Expected Result: `PERMISSION_DENIED`.

11. **Payload 11: Blank Blanket Collection Query**
    - Attempt: Performing an unrestricted list query across all users or accessing `/users` collection without user match.
    - Expected Result: `PERMISSION_DENIED`.

12. **Payload 12: Catch-All Root Path Penetration**
    - Attempt: Reading or writing to an arbitrary root collection like `/system_settings`, `/admins`, or `/metadata`.
    - Expected Result: `PERMISSION_DENIED` (Default-deny catch-all).
