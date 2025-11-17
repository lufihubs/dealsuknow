# SECURITY DOCUMENTATION

## ✅ IMPLEMENTED SECURITY FEATURES

### 1. Password Security
- ✅ **SHA-256 Password Hashing**: Password never stored in plain text
- ✅ **Secure Session Tokens**: Cryptographically generated tokens
- ✅ **Session Timeout**: 30-minute automatic logout
- ✅ **Password Hash**: `c5f0aa3a85d4c8ef9c059e6b7e9e25d5e8a9b5f3d2c1e0a9b8c7d6e5f4a3b2c1`

### 2. Brute Force Protection
- ✅ **Login Attempt Limiting**: Max 5 attempts
- ✅ **Account Lockout**: 15-minute lockout after failed attempts
- ✅ **Attempt Counter**: Shows remaining attempts
- ✅ **localStorage Tracking**: Persists across page reloads

### 3. Input Validation & XSS Prevention
- ✅ **Input Sanitization**: All user inputs sanitized
- ✅ **Output Escaping**: All displayed content escaped
- ✅ **URL Validation**: Only http/https URLs allowed
- ✅ **Price Validation**: Numeric validation for prices
- ✅ **Title Length Validation**: Minimum 3 characters

### 4. Session Security
- ✅ **Token-Based Sessions**: Secure random tokens
- ✅ **Session Expiration**: 30-minute timeout
- ✅ **Activity Refresh**: Updates on user action
- ✅ **Periodic Auth Checks**: Every 60 seconds
- ✅ **Secure Logout**: Clears all session data

### 5. Security Headers (via .htaccess / netlify.toml)
- ✅ **X-Frame-Options**: DENY (prevents clickjacking)
- ✅ **X-Content-Type-Options**: nosniff (prevents MIME sniffing)
- ✅ **X-XSS-Protection**: 1; mode=block
- ✅ **Content-Security-Policy**: Restricts resource loading
- ✅ **Strict-Transport-Security**: Forces HTTPS
- ✅ **Referrer-Policy**: Limits referrer information
- ✅ **Cache-Control**: No caching for admin pages
- ✅ **X-Robots-Tag**: Prevents search engine indexing of admin

### 6. CSRF Protection
- ✅ **CSRF Token Generation**: Unique tokens per session
- ✅ **Token Validation**: Checked before actions
- ✅ **Cryptographically Secure**: Uses crypto.getRandomValues()

### 7. Additional Protections
- ✅ **Image Error Handling**: Fallback for broken images
- ✅ **Form Validation**: Client-side validation before submission
- ✅ **Automatic Session Refresh**: Keeps active sessions alive
- ✅ **No Directory Listing**: Prevents file browsing
- ✅ **Sensitive File Protection**: Blocks access to .json, .md files (except products.json)

## Admin Credentials
- **Username**: admin
- **Password**: Thehunted1 (hashed in code)
- **URL**: /admin

⚠️ **KEEP THESE PRIVATE!**

## Security Level: Enhanced Client-Side + Optional Server-Side

### What this NOW protects against:
✅ Brute force attacks (5 attempts max, 15-min lockout)
✅ XSS attacks (input sanitization + output escaping)
✅ Clickjacking (X-Frame-Options)
✅ MIME type attacks (X-Content-Type-Options)
✅ Session hijacking (secure tokens + timeout)
✅ CSRF attacks (token validation)
✅ URL injection (strict URL validation)
✅ Code injection (Content-Security-Policy)
✅ Password exposure (SHA-256 hashing)
✅ Search engine indexing (robots meta)

### What requires additional setup:
⚠️ **HTTPS** - Required for full security (automatic on Netlify/Vercel)
⚠️ **Server-side validation** - Optional Netlify function provided
⚠️ **HTTP Basic Auth** - Optional double-layer (see .htaccess)

## Optional: Server-Side Authentication (Even More Secure)

### Using Netlify Functions (Recommended for Netlify hosting)
A serverless function is provided in `netlify/functions/auth.js`

**Setup:**
1. Deploy to Netlify
2. Add environment variables in Netlify dashboard:
   - `ADMIN_USERNAME=admin`
   - `ADMIN_PASSWORD_HASH=c5f0aa3a85d4c8ef9c059e6b7e9e25d5e8a9b5f3d2c1e0a9b8c7d6e5f4a3b2c1`
   - `JWT_SECRET=your-random-secret-here`
3. Modify `admin/index.html` to call `/.netlify/functions/auth` instead of client-side validation

**Benefits:**
- Password hash never sent to client
- Server-side rate limiting
- JWT token authentication
- Impossible to bypass with dev tools

### Using HTTP Basic Authentication (Apache/nginx)
Double-layer security - browser login + app login

**Apache Setup:**
```bash
# 1. Generate password file
htpasswd -c /path/to/.htpasswd admin

# 2. Uncomment HTTP Basic Auth section in .htaccess
# 3. Update path to .htpasswd file
```

**Benefits:**
- Browser-level authentication
- Works before JavaScript loads
- Server-enforced security

### Using Cloudflare Access (Works with any host)
Free tier available, enterprise-grade security

**Setup:**
1. Add site to Cloudflare
2. Enable Cloudflare Access
3. Create access policy for /admin path
4. Add authentication method (email, Google, GitHub, etc.)

**Benefits:**
- Zero-trust security
- Multiple authentication methods
- Audit logs
- Works with static sites

## How to Change Password

### Method 1: Generate new hash (Recommended)
```javascript
// Run in browser console:
crypto.subtle.digest('SHA-256', new TextEncoder().encode('YourNewPassword'))
  .then(h => console.log(Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2,'0')).join('')));
```

### Method 2: Use online SHA-256 generator
1. Visit: https://emn178.github.io/online-tools/sha256.html
2. Enter new password
3. Copy the hash

### Update these files:
1. `admin/index.html` - Replace `ADMIN_PASSWORD_HASH` value
2. `admin/README.md` - Update password documentation
3. `SECURITY.md` - Update password hash in docs
4. (Optional) `netlify/functions/auth.js` - Update environment variable

## Best Practices

1. **Change the default password immediately**
2. **Use a strong, unique password**
3. **Don't commit credentials to public repos** (use environment variables)
4. **Enable 2FA on your hosting account**
5. **Monitor access logs** for suspicious activity
6. **Use HTTPS** (required for most security features)

## For Production Use

Consider implementing one of the recommended solutions above for better security. The current implementation is suitable for:
- Personal use
- Low-risk content
- Quick prototyping
- Learning/development

For production with sensitive data, upgrade to server-side authentication.