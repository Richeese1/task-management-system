# 🚀 New Features Setup Guide

## 📧 Email Notifications Setup

### 1. Gmail Configuration
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate new app password for "TaskFlow"
3. **Update .env file**:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

### 2. Install New Dependencies
```bash
cd server
npm install nodemailer node-cron passport passport-google-oauth20 passport-facebook
```

### 3. Test Email Service
```bash
npm run dev
```
The notification service will start automatically and check for deadlines every hour.

---

## 🔐 Social Login Setup

### 1. Google OAuth Setup
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project** or select existing
3. **Enable APIs**:
   - Go to "APIs & Services" → "Library"
   - Search and enable "Google+ API" and "Google OAuth2 API"
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
5. **Update .env file**:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### 2. Facebook OAuth Setup
1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create New App**:
   - Select "Business" or "Other"
   - Add "Facebook Login" product
3. **Configure Facebook Login**:
   - Go to "Facebook Login" → "Settings"
   - Add authorized redirect URI: `http://localhost:5000/api/auth/facebook/callback`
4. **Update .env file**:
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

---

## 📋 How It Works

### Email Notifications
- **24-hour reminders**: Tasks due in next 24 hours
- **1-week reminders**: Tasks due in next 7 days
- **Overdue alerts**: Tasks that became overdue
- **Completion emails**: When tasks are marked as completed
- **Automatic scheduling**: Runs every hour via cron jobs

### Social Login
- **Google/Facebook OAuth**: One-click login
- **Account linking**: Links to existing accounts if email matches
- **Automatic registration**: Creates new account if first time
- **Secure authentication**: Uses JWT tokens after OAuth success

---

## 🧪 Testing

### Test Email Notifications
1. Create a task with due date tomorrow
2. Wait for the hourly check (or restart server)
3. Check your email for the reminder

### Test Social Login
1. Click "Google" or "Facebook" button on login/register page
2. Complete OAuth flow
3. Should redirect to dashboard automatically

---

## 🔧 Troubleshooting

### Email Issues
- **"Invalid login"**: Use App Password, not regular password
- **"Gmail not enabled": Enable "Less secure apps" or use App Password
- **No emails received**: Check spam folder

### OAuth Issues
- **Redirect URI mismatch**: Ensure exact match in Google/Facebook console
- **Client ID/Secret wrong**: Double-check .env values
- **Scope issues**: Ensure proper permissions are granted

---

## 🌟 Features Added

### ✨ Email Notifications
- 📧 Deadline reminders (24h, 1 week)
- 🎉 Task completion celebrations
- ⚠️ Overdue task alerts
- 🔄 Automatic hourly checks

### 🔐 Social Authentication
- 🚀 One-click Google login
- 📘 Facebook login integration
- 🔗 Account linking
- 🛡️ Secure JWT tokens

### 🎨 Enhanced UX
- 📱 Beautiful email templates
- 🎯 Professional OAuth buttons
- ⚡ Seamless authentication flow
- 📊 Notification tracking

Your Task Management System now has enterprise-grade features! 🚀
