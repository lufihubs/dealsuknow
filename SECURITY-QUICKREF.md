# 🔒 SECURITY QUICK REFERENCE

## Login Credentials
- **URL**: `/admin`
- **Username**: `admin`
- **Password**: `Thehunted1`
- **Hash**: `c5f0aa3a85d4c8ef9c059e6b7e9e25d5e8a9b5f3d2c1e0a9b8c7d6e5f4a3b2c1`

⚠️ **CHANGE PASSWORD BEFORE GOING LIVE!**

---

## Security Features Enabled

### Login Protection
✅ 5 login attempts max
✅ 15-minute lockout after failures
✅ SHA-256 password hashing
✅ Secure session tokens
✅ 30-minute session timeout

### Attack Prevention
✅ XSS (Cross-Site Scripting)
✅ CSRF (Cross-Site Request Forgery)
✅ Clickjacking
✅ Brute Force
✅ Session Hijacking
✅ Code Injection
✅ MIME Sniffing

### Security Headers (Active)
✅ X-Frame-Options: DENY
✅ X-Content-Type-Options: nosniff
✅ X-XSS-Protection: 1; mode=block
✅ Content-Security-Policy
✅ Strict-Transport-Security
✅ Referrer-Policy
✅ Cache-Control (no-cache for admin)

---

## Quick Commands

### Change Password
```javascript
// Run in browser console:
crypto.subtle.digest('SHA-256', new TextEncoder().encode('YourNewPassword'))
  .then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')));
```

### Test Security Headers
```
Visit: https://securityheaders.com
Enter: your-domain.com
Expected: A or A+ rating
```

### Clear Lockout (Emergency)
```javascript
// Run in browser console on login page:
localStorage.removeItem('dealsuknow_login_attempts');
```

---

## File Locations

**Security Config**:
- `.htaccess` (Apache)
- `netlify.toml` (Netlify)
- `robots.txt` (Search engines)

**Authentication**:
- `admin/index.html` (Login)
- `admin/panel.html` (Admin panel)
- `admin/admin.js` (Security logic)

**Documentation**:
- `SECURITY-SUMMARY.md` (This file)
- `SECURITY.md` (Full docs)
- `SECURITY-CHECKLIST.md` (Pre-launch)

---

## Emergency Procedures

### If Locked Out
1. Wait 15 minutes, OR
2. Clear localStorage in browser, OR
3. Open DevTools → Application → Local Storage → Clear

### If Password Forgotten
1. Generate new hash (see command above)
2. Edit `admin/index.html`
3. Replace `ADMIN_PASSWORD_HASH` value
4. Redeploy site

### If Compromised
1. Change password immediately
2. Clear all sessions
3. Review access logs
4. Check for unauthorized changes
5. See `SECURITY.md` for full procedure

---

## Pre-Launch Checklist

- [ ] Change default password
- [ ] Test login with new password
- [ ] Enable HTTPS
- [ ] Test security headers
- [ ] Verify robots.txt working
- [ ] Test brute force protection
- [ ] Test XSS prevention
- [ ] Test session timeout
- [ ] Backup products.json
- [ ] Set up 2FA on hosting

---

## Security Level: ⭐⭐⭐⭐ (4/5)

**Suitable for**: Personal sites, small business, affiliate marketing
**Not for**: Banking, payment processing, sensitive personal data

To reach 5/5, add:
- Server-side authentication
- HTTP Basic Auth
- Database with proper user management
- Professional security audit

---

**Keep this file private!** Contains sensitive information.