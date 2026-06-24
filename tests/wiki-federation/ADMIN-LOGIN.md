# Admin Login Guide

## How to Login as Admin

Your wikis are pre-claimed with admin privileges. To log in as admin:

### Step 1: Access the Wiki
- Alice: http://localhost:3001
- Bob: http://localhost:3002
- Carol: http://localhost:3003

**IMPORTANT:** Access via localhost port numbers, NOT via alice.localhost URLs in the browser address bar.

### Step 2: Click the Padlock
- Click the 🔒 padlock icon in the footer
- You'll see: "Welcome back [name]. Please enter your reclaim code."

### Step 3: Enter the Admin Secret
```
planetnine-admin-secret-2024
```

### Step 4: Verify Admin Access
- The padlock should change to 🔓 (unlocked)
- You can now use plugmatic to install plugins
- You have full admin privileges

## Admin Secret (Same for All Wikis)
```
planetnine-admin-secret-2024
```

## Troubleshooting

### Getting 403 Forbidden in Plugmatic?
- You're not logged in as admin
- Click the padlock and enter the secret above

### Padlock asks to "Claim this Wiki"?
- You're accessing via the wrong URL
- Use http://localhost:300X not http://alice.localhost:3001
- Farm mode creates different sites based on Host header

### Browser not saving login?
- Check that cookies are enabled
- Try incognito/private mode to test fresh session
- Session duration is 7 days

## What Makes You Admin?

1. **wiki_admin environment variable:** `planetnine-admin-secret-2024`
2. **owner.json files:** All have `"secret": "planetnine-admin-secret-2024"`
3. **Admin check:** When you log in with this secret, `req.session.friend` matches `wiki_admin`
4. **Result:** `security.isAdmin(req)` returns true

## Technical Details

The wiki-security-friends module checks:
```javascript
security.isAdmin = (req) ->
  if req.session.friend is admin  // admin = wiki_admin env var
    return true
```

When you reclaim with the correct secret:
1. POST to `/auth/reclaim/` with secret
2. Server sets `req.session.friend = owner.friend.secret`
3. If that matches `wiki_admin`, you're admin
4. Session cookie persists for 7 days
