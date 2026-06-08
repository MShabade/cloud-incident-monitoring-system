# Use Cases

## UC-01 User Registration

Actor:
Guest User

Description:
Allows a new user to create an account.

Preconditions:
User is not authenticated.

Postconditions:
User account created successfully.

---

## UC-02 User Login

Actor:
Registered User

Description:
Allows users to authenticate and receive access to protected functionality.

Preconditions:
Valid account exists.

Postconditions:
JWT token issued.

---

## UC-03 Create Incident

Actor:
User

Description:
Create a new cloud infrastructure incident.

Preconditions:
Authenticated user.

Postconditions:
Incident stored in database.

---

## UC-04 Update Incident

Actor:
User

Description:
Update incident status and details.

Preconditions:
User owns incident or has permission.

Postconditions:
Incident updated.

---

## UC-05 Manage Users

Actor:
Administrator

Description:
Manage platform users and permissions.

Preconditions:
Administrator account.

Postconditions:
User roles updated.

---

## UC-06 View Audit Logs

Actor:
Administrator

Description:
Review platform activities for compliance and security monitoring.

Preconditions:
Administrator account.

Postconditions:
Audit data displayed.

