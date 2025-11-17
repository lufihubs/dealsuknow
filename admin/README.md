# Admin Panel - Quick Guide

## Access
Navigate to: `yoursite.com/admin`

**Keep this URL private!** This is your admin panel - don't share or link it publicly.

## Features

### View Products
- See all products with thumbnails
- Shows title, price, and badge
- Displays product count

### Add Products
1. Fill out the form at the top
2. Required: Title, Image URL, Amazon URL, Price
3. Optional: Badge (e.g., "Deal", "Hot", "Popular")
4. Click "Add Product"

### Edit Products
1. Click the "Edit" button on any product
2. The form will populate with existing data
3. Make your changes
4. Click "Update Product"
5. Click "Cancel" to abort editing

### Delete Products
1. Click the "Delete" button on any product
2. Confirm the deletion
3. Product is removed immediately

### Save Changes
1. After making changes, click "Download products.json"
2. Upload the file to your hosting:
   - **GitHub**: Use GitHub mobile app to edit/replace `products.json`
   - **FTP**: Upload via FTP client
   - **Netlify/Vercel**: Drag & drop in dashboard or push to git

## Mobile-Friendly
- Optimized for phone editing
- Large touch targets
- Responsive layout
- Easy image URL pasting

## Tips for Mobile
- Use Amazon app: Share → Copy Link
- Use Photos: Share → Copy (for image URLs from cloud services)
- Long-press to paste URLs quickly
- Edit multiple products before downloading JSON once

## Security
- Keep the `/admin` URL private
- Consider adding password protection (see `.htaccess` file)
- Don't commit sensitive credentials to public repos