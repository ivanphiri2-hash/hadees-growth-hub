Hadees, since your website is already **live on Vercel** and **hadeestrading.co.za** is connected, the safest approach is to **promote your account to a Super Admin** instead of treating `admin@hadeestrading.co.za` as a normal staff user.

From what you've described, your RBAC (Role-Based Access Control) is probably doing something like this:

```text
User
   ↓
Authenticated
   ↓
Staff
   ↓
Admin
```

The problem is that `admin@hadeestrading.co.za` is still being evaluated as **staff**, so every page checks for `staff_access_required`.

## What you should have

```
Super Admin (Owner)
│
├── Full Dashboard
├── Leads
├── Clients
├── Bookings
├── Quotations
├── Projects
├── Invoices
├── Tenders
├── Staff
├── Website CMS
├── Settings
├── Analytics
├── Payments
├── AI Assistant
├── Audit Logs
└── Everything
```

Staff should only have permissions you explicitly grant.

---

# Prompt for Lovable

Paste this into Lovable exactly.

---

## SYSTEM TASK

The owner account `admin@hadeestrading.co.za` must become the permanent **Super Admin** of the Hadees Trading platform.

Remove every restriction that treats this account as a staff member.

### Create the following hierarchy

```
SUPER_ADMIN
ADMIN
MANAGER
STAFF
CLIENT
```

---

### SUPER_ADMIN Permissions

Grant unrestricted access to:

* Dashboard
* Leads
* Clients
* Bookings
* Quotations
* Invoices
* Payments
* Projects
* Tenders
* CRM
* Calendar
* Website Content
* Contact Forms
* Staff
* User Management
* Roles
* Analytics
* Reports
* Settings
* Storage
* AI Assistant
* Notifications
* Audit Logs
* Integrations
* Stripe
* PayFast
* Email
* Domain Settings
* Security

Never require staff permissions for Super Admin.

---

### Owner Email

The following email must always be treated as Super Admin:

```
admin@hadeestrading.co.za
```

When this account logs in:

```
role = SUPER_ADMIN
```

Never downgrade this account.

---

### Dashboard

Show every widget:

* Total Leads
* Total Clients
* Active Projects
* Quotations
* Bookings
* Pending Payments
* Revenue
* New Messages
* Website Visitors
* Tender Alerts
* AI Activity
* Calendar
* Notifications

---

### Clients Module

Allow Super Admin to

* View all clients
* Edit clients
* Delete clients
* Suspend clients
* Activate clients
* Export clients
* Search clients
* View submitted documents

---

### Leads

Allow Super Admin to

* View every lead
* Assign leads
* Delete leads
* Convert lead to client
* Export

---

### Bookings

Allow Super Admin to

* View
* Approve
* Reject
* Reschedule
* Delete

---

### Staff

Allow Super Admin to

* Create staff
* Edit staff
* Delete staff
* Suspend staff
* Assign permissions
* Reset passwords

---

### Portal

When a client signs up or fills a form:

Automatically create a Client record.

Show instantly inside

```
Admin Dashboard
→ Clients
```

When a lead submits a quotation request:

Automatically appear inside

```
Admin Dashboard
→ Leads
```

When a booking is submitted:

Automatically appear inside

```
Admin Dashboard
→ Bookings
```

Use realtime subscriptions so new data appears without refreshing.

---

### Security

Never allow

```
staff_access_required
```

to block Super Admin.

Permission check should be

```
if role == SUPER_ADMIN

allow()

else

checkPermission()
```

---

### Database

Ensure the owner account exists.

If it already exists,

update its role to

```
SUPER_ADMIN
```

---

### Row Level Security

Allow Super Admin

```
SELECT
INSERT
UPDATE
DELETE
```

on every table.

---

### UI

Hide no menu items for Super Admin.

Always display

* Clients
* Leads
* Bookings
* Staff
* Payments
* Settings
* CRM
* Analytics
* AI
* Reports
* Website
* Integrations

---

### Final Requirement

Test using

```
admin@hadeestrading.co.za
```

Confirm:

* No permission denied errors.
* No staff access required messages.
* Full platform access.
* Client registrations immediately appear in Admin → Clients.
* Lead forms immediately appear in Admin → Leads.
* Booking requests immediately appear in Admin → Bookings.
* System is production-ready for [https://hadeestrading.co.za](https://hadeestrading.co.za).

---

## One more thing to verify

If you're using **Supabase**, this issue is often caused by one of these:

1. The user record in your `profiles` (or `users`) table still has `role = staff` or `role = admin` instead of `SUPER_ADMIN`.
2. Your **Row Level Security (RLS)** policies only allow staff-level access and don't explicitly exempt the Super Admin.
3. The frontend checks permissions based on a permissions table rather than the email or role, so the owner account isn't receiving the correct permission set.

If you can share:

* your **Supabase schema** for `profiles`, `users`, or `roles`, or
* the **Lovable project link** or the relevant dashboard permission code,

I can help you pinpoint the exact change rather than relying on a general permissions update.
