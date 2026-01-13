# GroomGroove Setup Guide

## Quick Start (5 minutes)

---

### Step 1: Open the App

Open your browser and go to:

```
http://localhost:3000
```

---

### Step 2: Create Your Account

1. Click **"Sign up"**
2. Enter your email address
3. Enter a password (at least 6 characters)
4. Click **"Sign up"**

You'll be taken straight to the Dashboard.

---

### Step 3: Add Your First Client

1. Click **"Clients"** in the left sidebar
2. Click **"Add New Client"** button
3. Fill in the form:
   - **First Name**: e.g., Sarah
   - **Surname**: e.g., Johnson
   - **Email**: e.g., sarah@email.com
   - **Phone**: e.g., 0412 345 678
4. Click **"Create Client"**

---

### Step 4: Add a Dog to the Client

1. Click on the client you just created
2. In the side panel, you'll see their details
3. Click **"View Dog"** or navigate to add a dog
4. Fill in dog details:
   - **Name**: e.g., Milo
   - **Breed**: e.g., Golden Retriever
   - **Weight**: e.g., 30kg

---

### Step 5: Book an Appointment

1. Click **"Calendar"** in the left sidebar
2. Click **"New Appointment"** button (or use the + button)
3. Select:
   - **Client**: Choose from dropdown
   - **Dog**: Choose from dropdown
   - **Date & Time**: Pick a slot
   - **Services**: Select what you'll do (Full Groom, Bath & Brush, etc.)
4. Click **"Create Appointment"**

The appointment now appears on your Calendar and Dashboard.

---

### Step 6: Complete an Appointment

When the client arrives and you finish grooming:

1. Go to **Dashboard**
2. Find the appointment in "Today's Appointments"
3. Click the green **"Complete"** button
4. Review the services and total
5. Click **"Mark Service Complete"**
6. Choose payment method (Card or Cash)
7. Optionally schedule their next appointment
8. Click **"Complete Payment"**
9. Print or email the receipt

---

## Daily Workflow

### Morning
1. Open Dashboard to see today's appointments
2. Check which dogs are coming in
3. Note any special concerns (anxious dogs, first visits)

### During the Day
1. When a client arrives, their appointment shows on Dashboard
2. After grooming, click **"Complete"** to checkout
3. Collect payment and print receipt

### Automatic Reminders
- SMS reminders are sent automatically 1 hour before each appointment
- No action needed from you!
- Check **"Notifications"** page to see reminder status

---

## Navigation Guide

| Icon | Page | What it does |
|------|------|--------------|
| 🏠 | Dashboard | Today's overview |
| 👥 | Clients | Manage clients & dogs |
| 📅 | Calendar | View/book appointments |
| 🔔 | Notifications | SMS reminder status |
| ⏰ | History | Past appointments |
| ⚙️ | Settings | App settings |

---

## Keyboard Shortcuts

Hold **Cmd + Option** (Mac) or **Ctrl + Alt** (Windows) and press:

| Key | Goes to |
|-----|---------|
| 1 | Dashboard |
| 2 | Clients |
| 3 | Calendar |
| 4 | Notifications |
| 5 | History |
| 6 | Settings |
| N | New Appointment |

---

## Troubleshooting

### "Page not loading"
- Refresh the page (Cmd + R)
- Check the terminal is still running `npm run dev`

### "Can't log in"
- Make sure email confirmation is disabled in Supabase
- Check your password is at least 6 characters

### "Appointment not showing"
- Check you selected the correct date on the calendar
- Refresh the page

---

## Need Help?

Contact support or check the GitHub repo for updates.

---

*GroomGroove - Making dog grooming simple*
