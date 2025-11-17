dealsuknow — Static product listing site

What you get
- A mobile-friendly static site using Bootstrap, Poppins font, and FontAwesome icons.
- `index.html` - public product listing that reads `products.json`.
- `admin/` - full CRUD admin panel (view, add, edit, delete products) accessible at `/admin`
- `products.json` - example product list.
- `assets/` - JS and CSS
- `.htaccess` and `_redirects` - routing config for Apache and Netlify

How to host
1. Create a GitHub repo and push the workspace. You can use GitHub Pages (repository -> Settings -> Pages) to host the site from `main` branch `/ (root)`.
2. Once hosted, you can edit `products.json` from the GitHub mobile app (or replace it by uploading the downloaded `new-product.json` contents merged into the array).

Editing products from your phone
- Navigate to `yourdomain.com/admin` (keep this URL private!)
- **Login** with username: `admin` and password: `Thehunted1`
- View all existing products with thumbnails
- **Add new products**: Fill the form and tap "Add Product"
- **Edit products**: Tap the "Edit" button on any product, modify fields, and save
- **Delete products**: Tap the "Delete" button and confirm
- When done, tap "Download products.json" and upload it to replace the old file (or use GitHub mobile to edit)
- Click "Logout" when finished

The admin panel:
- **Secure login** (username: admin, password: Thehunted1)
- **Brute force protection** (5 attempts max, 15-min lockout)
- **Session timeout** (30 minutes automatic logout)
- **XSS & CSRF protection** (input sanitization, token validation)
- Lists all products with thumbnails, edit, and delete buttons
- Mobile-optimized for easy phone editing
- Not linked from the public site (keep `/admin` URL and credentials private)

**Security Features**: SHA-256 password hashing, secure session tokens, multiple security headers, input validation, and more. See `SECURITY-SUMMARY.md` for details.

Notes
- Static sites cannot directly write files on the server. The admin flow downloads JSON for manual merging. If you want direct mobile editing, consider using Netlify functions or a small backend service (I can add that).

Next steps I can help with
- Add search, categories, or sorting.
- Add serverless write support (Netlify Functions) so admin can add products from phone directly.
- Wire up affiliate tracking parameters for Amazon links.
