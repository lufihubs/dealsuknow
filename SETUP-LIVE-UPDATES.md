# 🚀 How to Enable Live Product Updates

## The Problem
Your products save in the admin panel but don't show on the main site because:
- **localStorage is domain-specific** - It only works on the same exact domain
- **Netlify is a static host** - It can't dynamically update files

## The Solution: GitHub Sync
Your products will sync directly to GitHub, which triggers Netlify to rebuild your site automatically!

---

## 📋 Setup Instructions (5 minutes)

### Step 1: Create GitHub Personal Access Token

1. Go to: **https://github.com/settings/tokens/new**
2. Fill in:
   - **Note**: `dealsuknow-admin`
   - **Expiration**: `No expiration` (or 1 year)
   - **Scopes**: Check ✅ **repo** (gives full control of private repositories)
3. Click **"Generate token"** at the bottom
4. **COPY THE TOKEN** - You can only see it once!
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Add Token to Your Site

1. Open the file: `admin/github-sync.js`
2. Find this line:
   ```javascript
   token: 'YOUR_GITHUB_TOKEN' // REPLACE THIS!
   ```
3. Replace `YOUR_GITHUB_TOKEN` with your actual token:
   ```javascript
   token: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
   ```
4. **Save the file**

### Step 3: Push Changes to GitHub

Open PowerShell in your project folder and run:

```powershell
git add .
git commit -m "Add GitHub sync for live updates"
git push origin main
```

### Step 4: Wait for Netlify Deploy (~1 minute)

- Netlify will automatically detect the changes and rebuild your site
- Check: https://app.netlify.com/sites/YOUR-SITE/deploys

---

## ✅ How to Use

### Adding/Editing Products:

1. **Go to your admin panel**: `https://yoursite.com/admin/panel.html`
2. **Add or edit products** - They save locally immediately
3. **Click "Sync to GitHub"** button - This updates the live site
4. **Wait ~1 minute** - Netlify rebuilds automatically
5. **Refresh your main site** - Products now visible to everyone! 🎉

### Important Notes:

- ✅ Products are saved **locally** as you add them (you can see them in admin)
- ⚠️ Products only appear on the **live site** after clicking "Sync to GitHub"
- 🔄 Syncing triggers a **Netlify rebuild** (~30-60 seconds)
- 📱 Works from **any device** - phone, tablet, computer

---

## 🔒 Security Note

**Your GitHub token is sensitive!** 

⚠️ **Never share your `github-sync.js` file publicly after adding the token**

To keep it secure:
1. Only access admin panel from trusted devices
2. Use HTTPS (Netlify provides this automatically)
3. Keep your admin URL private
4. Consider regenerating the token every few months

---

## 🐛 Troubleshooting

### "Products not showing after sync"
- Wait 1-2 minutes for Netlify rebuild
- Check Netlify deploy logs for errors
- Clear browser cache and refresh

### "GitHub Token Not Configured"
- Make sure you replaced `YOUR_GITHUB_TOKEN` in `github-sync.js`
- Push changes to GitHub
- Wait for Netlify to deploy

### "Unauthorized error"
- Token might be expired or invalid
- Generate a new token and update `github-sync.js`
- Make sure token has `repo` scope

---

## 🎯 Alternative: Manual Update (Without GitHub Token)

If you don't want to use GitHub sync:

1. Click **"Backup: Download JSON"** in admin
2. Replace `products.json` in your project
3. Commit and push manually:
   ```powershell
   git add products.json
   git commit -m "Update products"
   git push origin main
   ```

---

## 📞 Need Help?

The debug button shows:
- How many products are saved
- Current domain
- Storage size

Click it if products aren't syncing properly!
