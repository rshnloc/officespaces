# Hostinger Deployment Guide for example.com

This document provides complete, step-by-step instructions for deploying the **Gramwork Spaces** full-stack application (React 19 Frontend + Laravel 11/12 Backend) to **Hostinger** on the domain **`example.com`**.

---

## 🏗️ Architecture Overview

| Component | Target URL | Server Path on Hostinger |
| :--- | :--- | :--- |
| **Frontend (React + Vite SPA)** | `https://example.com` | `domains/example.com/public_html/` |
| **Backend (Laravel API)** | `https://api.example.com` | `domains/example.com/backend/public/` |
| **Uploaded Media / Images** | `https://api.example.com/storage/...` | `backend/storage/app/public/` (via symlink) |
| **Database** | MySQL 8.x | Hostinger MySQL (`localhost` / `127.0.0.1`) |

---

## 📋 Pre-Flight Checklist

Before beginning, ensure you have:
1. Access to **Hostinger hPanel** (`https://hpanel.hostinger.com`).
2. The domain **`example.com`** added and pointing to your Hostinger hosting account.
3. Hostinger PHP version set to **PHP 8.3** (Laravel 11/12 requires PHP >= 8.3).

---

## Step 1: Configure PHP 8.3 & Extensions in Hostinger hPanel

1. Log in to **Hostinger hPanel**.
2. Go to **Advanced** → **PHP Configuration** (or search for *PHP* in the search bar).
3. Select PHP version **8.3** and click **Update**.
4. Switch to the **PHP Extensions** tab and verify the following are enabled:
   - `fileinfo`
   - `pdo_mysql`
   - `mbstring`
   - `openssl`
   - `curl`
   - `gd` or `imagick`
   - `zip`
   - `intl`
5. Switch to **PHP Options** tab:
   - `upload_max_filesize` = `64M`
   - `post_max_size` = `64M`
   - `memory_limit` = `256M` or `512M`

---

## Step 2: Create Hostinger MySQL Database

1. In hPanel, navigate to **Databases** → **MySQL Databases**.
2. Fill out the form:
   - **Database Name**: e.g., `gramdb` (Full name will look like: `u123456789_gramdb`)
   - **Username**: e.g., `gramuser` (Full username will look like: `u123456789_gramuser`)
   - **Password**: Generate a strong password and save it securely.
3. Click **Create**.
4. Note down:
   - **DB_HOST**: `localhost` (or `127.0.0.1`)
   - **DB_DATABASE**: `u123456789_gramdb`
   - **DB_USERNAME**: `u123456789_gramuser`
   - **DB_PASSWORD**: your chosen password

---

## Step 3: Create Subdomain for API (`api.example.com`)

Using a subdomain ensures your backend `.env`, `composer.json`, and source code are never exposed to the public web.

1. In hPanel, go to **Domains** → **Subdomains**.
2. Set:
   - **Subdomain**: `api`
   - Check **Custom folder for subdomain**: Enter: `domains/example.com/backend/public` *(or `backend/public` depending on your account structure)*
3. Click **Create**.
4. Go to **Security** → **SSL** and install a free Let's Encrypt SSL certificate for:
   - `example.com`
   - `api.example.com`

---

## Step 4: Upload & Setup Backend (Laravel)

### Option A: Via SSH (Fastest & Recommended)
1. Enable SSH in hPanel under **Advanced** → **SSH Access**.
2. Connect via your local terminal:
   ```bash
   ssh -p <PORT> <USERNAME>@<HOST_IP>
   ```
3. Navigate to your domain directory:
   ```bash
   cd domains/example.com
   ```
4. Upload or clone the backend code into a folder named `backend`:
   *(If uploading a `.zip` file via File Manager, extract it here)*
   ```bash
   cd backend
   ```
5. Install dependencies without dev tools:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
6. Create the `.env` file:
   ```bash
   cp .env.example .env
   nano .env
   ```
7. Configure your production settings in `.env`:
   ```env
   APP_NAME="Gramwork Spaces"
   APP_ENV=production
   APP_KEY=
   APP_DEBUG=false
   APP_URL=https://api.example.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=u123456789_gramdb
   DB_USERNAME=u123456789_gramuser
   DB_PASSWORD=your_actual_db_password

   FILESYSTEM_DISK=public
   CACHE_STORE=file
   SESSION_DRIVER=file
   QUEUE_CONNECTION=database

   SANCTUM_STATEFUL_DOMAINS=example.com,www.example.com,api.example.com
   ```
8. Generate application key:
   ```bash
   php artisan key:generate --force
   ```
9. Run migrations and seed default data:
   ```bash
   php artisan migrate --force
   php artisan db:seed --force
   ```
10. Create storage symlink for uploaded images:
    ```bash
    php artisan storage:link
    ```
11. Optimize caches:
    ```bash
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    ```
12. Set proper permissions:
    ```bash
    chmod -R 775 storage bootstrap/cache
    ```

---

### Option B: Via Hostinger File Manager & phpMyAdmin (No SSH)
1. **Compress Backend locally**:
   - On your local computer, open the `backend` folder.
   - Delete `vendor` folder (if present) to save upload time.
   - Zip all files and folders inside `backend/` into `backend.zip`.
2. **Upload & Extract**:
   - Open Hostinger **File Manager**.
   - In `domains/example.com/`, create a new folder named `backend`.
   - Upload `backend.zip` into `domains/example.com/backend/`.
   - Right click `backend.zip` → **Extract**.
3. **Configure `.env`**:
   - In the `backend` folder, copy `.env.production.example` and rename it to `.env`.
   - Fill in your `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
4. **Database Import**:
   - If SSH is not available to run migrations, export your local MySQL database using phpMyAdmin or mysqldump:
     ```bash
     mysqldump -u root -p office_booking > database.sql
     ```
   - In Hostinger hPanel, go to **Databases** → Click **Enter phpMyAdmin** next to your database.
   - Click the **Import** tab and upload `database.sql`.

---

## Step 5: Build & Upload Frontend (React SPA)

### 1. Build locally with Production API URL:
Create or edit `.env.production` in the project root:
```env
VITE_API_URL=https://api.example.com/api/v1
```

Run the build command:
```bash
npm run build
```

This generates production-optimized static files in the **`dist/`** directory.
*(Notice: Vite automatically includes `.htaccess` inside `dist/` to handle React Router client-side routes!)*

### 2. Upload to Hostinger `public_html`:
1. Open Hostinger **File Manager**.
2. Navigate to:
   `domains/example.com/public_html`
3. Delete default placeholder files (e.g. `default.php`).
4. Upload all files and folders from inside your local `dist/` directory into `public_html`:
   - `assets/` (folder)
   - `images/` (folder)
   - `index.html`
   - `.htaccess`
   - `favicon.svg`
   - `icons.svg`

*(Tip: You can zip the contents of `dist`, upload `dist.zip` into `public_html`, and extract it there).*

---

## Step 6: Verify SPA Routing (.htaccess)

Ensure the `.htaccess` file inside `public_html` contains the following rewrite rules so that page refreshes on `/spaces`, `/login`, `/dashboard` don't return a 404 error:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Step 7: Default Credentials for First Login

Once migrations and seeders have run, you can access the admin dashboard at:
👉 **`https://example.com/login`**

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@gramworkspace.com` | `admin123456` |
| **Demo Customer** | `customer@example.com` | `password123` |

> ⚠️ **Important**: Immediately change these default passwords inside the Admin Portal under Profile Settings after deployment!

---

## Step 8: Cron Jobs & Background Tasks (Optional)

If your app schedules booking status updates or sends reminder emails:
1. In hPanel, go to **Advanced** → **Cron Jobs**.
2. Choose **Custom**.
3. Set time to every minute (`* * * * *`).
4. Set command:
   ```bash
   /usr/bin/php8.3 /home/u123456789/domains/example.com/backend/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Replace `/home/u123456789/` with your actual Hostinger account path, visible on the top of File Manager).*

---

## 🛠️ Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **500 Server Error on API** | Missing `.env`, wrong DB details, or permissions | Check `backend/storage/logs/laravel.log`. Ensure `chmod -R 775 storage bootstrap/cache`. |
| **CORS Error in Browser** | Mismatch between frontend origin and backend | Ensure `backend/config/cors.php` has `'allowed_origins' => ['*']` or includes `https://example.com`. |
| **404 on page reload** | Missing `.htaccess` in `public_html` | Ensure `.htaccess` exists in `public_html` with rewrite rules pointing to `index.html`. |
| **Images not loading** | Storage symlink missing | Run `php artisan storage:link` inside the backend directory. |
| **Composer / PHP Version Error** | Hostinger using older PHP | Go to hPanel → PHP Configuration → Set to **PHP 8.3**. |
