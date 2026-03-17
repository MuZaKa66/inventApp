# Windows Deployment Guide - Non-Dedicated System

## System Overview
This app will run on a **regular Windows computer** used for daily work, not a dedicated server.

---

## Prerequisites

### Hardware (Non-Dedicated System)
- **CPU**: Any modern processor (i3/i5 or equivalent)
- **RAM**: 4GB available (8GB total system recommended)
- **Storage**: 10GB free space (SSD preferred)
- **OS**: Windows 10 or Windows 11
- **Network**: No special requirements (runs on localhost)

**The system will run alongside your normal Windows applications.**

---

## Installation Steps

### Step 1: Install Node.js

1. **Download Node.js 18 (LTS)**:
   - Go to: https://nodejs.org/
   - Download: "18.x.x LTS" (Windows Installer .msi)
   - Choose: 64-bit version

2. **Install Node.js**:
   - Run the downloaded .msi file
   - Click "Next" through wizard
   - ✅ Check: "Automatically install necessary tools"
   - Click "Install"
   - Restart computer after installation

3. **Verify Installation**:
   - Open Command Prompt (Win + R, type `cmd`, Enter)
   - Type: `node --version`
   - Should show: `v18.x.x`
   - Type: `npm --version`
   - Should show: `9.x.x` or `10.x.x`

---

### Step 2: Deploy Application

**Option A: From Bolt.new ZIP** (Recommended)

1. **Download from Bolt.new**:
   - After building in Bolt.new
   - Click "Download" or "Export"
   - Saves as: `security-sales-app.zip`

2. **Extract to Desktop**:
   - Right-click ZIP → "Extract All"
   - Choose location: `C:\SecuritySales`
   - Click "Extract"

3. **Install Dependencies**:
   - Open Command Prompt
   - Type: `cd C:\SecuritySales`
   - Type: `npm install`
   - Wait 2-5 minutes (downloads packages)

**Option B: From Git Repository**

1. Install Git: https://git-scm.com/download/win
2. Open Command Prompt
3. Type: `cd C:\`
4. Type: `git clone [your-repo-url] SecuritySales`
5. Type: `cd SecuritySales`
6. Type: `npm install`

---

### Step 3: First Run & Configuration

1. **Create Desktop Shortcut** (for easy access):
   - Create file: `Start-SecuritySales.bat` on Desktop
   - Content:
   ```batch
   @echo off
   cd C:\SecuritySales
   npm start
   ```
   - Save and double-click to run

2. **Start Application**:
   - Double-click `Start-SecuritySales.bat`
   - OR in Command Prompt:
     ```cmd
     cd C:\SecuritySales
     npm start
     ```
   - Wait 5-10 seconds
   - You'll see: "Server running on http://localhost:3000"

3. **Open in Browser**:
   - Open Google Chrome or Edge
   - Go to: `http://localhost:3000`
   - **Bookmark this page!**

4. **First Login**:
   - Username: `admin`
   - Password: `Admin@123`
   - **IMPORTANT**: Change password immediately!

---

### Step 4: Daily Usage

**To Start the App** (each day):
- Double-click Desktop shortcut: `Start-SecuritySales.bat`
- Wait 5 seconds
- Open browser: `http://localhost:3000`

**To Stop the App** (end of day):
- Close Command Prompt window
- OR press `Ctrl + C` in Command Prompt

**The app ONLY runs when the Command Prompt window is open.**

---

## Auto-Start on Windows Boot (Optional)

If you want the app to start automatically when Windows starts:

### Method 1: Startup Folder (Simple)

1. Press `Win + R`
2. Type: `shell:startup`
3. Press Enter (opens Startup folder)
4. Copy your `Start-SecuritySales.bat` here
5. Restart Windows to test

**Note**: Command Prompt window will appear on startup (you can minimize it)

### Method 2: Windows Service (Advanced - Stays in Background)

1. **Install PM2 for Windows**:
   ```cmd
   npm install -g pm2
   npm install -g pm2-windows-startup
   ```

2. **Configure PM2**:
   ```cmd
   cd C:\SecuritySales
   pm2 start npm --name "security-sales" -- start
   pm2 save
   pm2-startup install
   ```

3. **Benefits**:
   - Runs in background (no visible window)
   - Auto-starts with Windows
   - Auto-restarts if crashes
   - View status: `pm2 status`

---

## Accessing from Other Computers (Optional)

If you want to access from other PCs/tablets on same network:

### 1. Find Your Computer's IP Address

- Open Command Prompt
- Type: `ipconfig`
- Look for: "IPv4 Address"
- Example: `192.168.1.100`

### 2. Allow Firewall Access

**Windows 10/11**:
1. Open "Windows Defender Firewall"
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Rule Type: Port
5. Port: 3000
6. Allow connection
7. Apply to all profiles
8. Name: "SecuritySalesApp"
9. Finish

**Or use this command** (as Administrator):
```cmd
netsh advfirewall firewall add rule name="SecuritySalesApp" dir=in action=allow protocol=TCP localport=3000
```

### 3. Access from Other Devices

- On same WiFi/network
- Open browser
- Go to: `http://192.168.1.100:3000`
- (Replace with your actual IP)

---

## Backup Strategy (IMPORTANT for Non-Dedicated System)

Since this is not a dedicated server, **manual backups are critical**.

### Manual Backup (Daily Recommended)

**Quick Backup**:
1. Close the app (Ctrl + C in Command Prompt)
2. Copy entire folder: `C:\SecuritySales`
3. Paste to external drive or network location
4. Name: `SecuritySales-Backup-2026-03-16`

**Smart Backup** (database + uploads only):
1. In app: Go to Settings → Backup
2. Click "Create Backup Now"
3. Downloads: `backup-YYYYMMDD.zip`
4. Save to external drive

### Automated Backup Script

Create: `Daily-Backup.bat` on Desktop:
```batch
@echo off
echo Creating backup...
set TODAY=%date:~-4%%date:~-7,2%%date:~-10,2%
xcopy "C:\SecuritySales\database" "D:\Backups\SecuritySales\%TODAY%\database" /E /I /Y
xcopy "C:\SecuritySales\uploads" "D:\Backups\SecuritySales\%TODAY%\uploads" /E /I /Y
echo Backup completed to D:\Backups\SecuritySales\%TODAY%
pause
```

**Schedule Daily** (Windows Task Scheduler):
1. Open "Task Scheduler"
2. Create Basic Task
3. Name: "Security Sales Backup"
4. Trigger: Daily at 6:00 PM
5. Action: Start a program
6. Program: `C:\Users\[YourName]\Desktop\Daily-Backup.bat`
7. Finish

---

## Troubleshooting

### "Port 3000 already in use"

**Solution 1**: Close the existing instance
- Find Command Prompt window running the app
- Press Ctrl + C
- Try starting again

**Solution 2**: Change port
- Edit `.env` file in `C:\SecuritySales`
- Change: `PORT=3000` to `PORT=3001`
- Restart app
- Access at: `http://localhost:3001`

### "Cannot find module"

**Solution**: Reinstall dependencies
```cmd
cd C:\SecuritySales
del /s /q node_modules
npm install
```

### "Database is locked"

**Solution**: Close all app instances
- Close all browser tabs with the app
- Close Command Prompt window
- Wait 10 seconds
- Restart app

### App is slow

**Possible causes**:
- Too many browser tabs open
- Other heavy programs running
- Database needs optimization

**Solutions**:
1. Close unused tabs
2. Close heavy programs (video editing, games)
3. In app: Settings → Database → "Optimize Database"
4. Restart computer

---

## Performance Tips for Non-Dedicated System

### Optimize for Shared Use

1. **Close app when not in use** (saves RAM)
2. **Use Chrome/Edge** (better performance than older browsers)
3. **Keep database small**:
   - Archive old data quarterly
   - Keep only active products in catalog
4. **Regular cleanup**:
   - Delete unused product images
   - Remove old backups from disk

### Minimum System Resources

When app is running:
- **RAM usage**: ~200-300 MB
- **CPU usage**: <5% (idle), 10-20% (active)
- **Disk I/O**: Minimal

**Your computer should handle normal work + this app easily.**

---

## Multi-User Access (Same Network)

If multiple staff need access:

1. **Keep computer running** (don't sleep)
2. **Share IP address** with staff
3. **They access**: `http://192.168.1.100:3000`
4. **Or create shortcut** on their desktops

**Important**:
- Only ONE computer runs the app
- Others access via browser
- All users must be on same WiFi/network

---

## Upgrading the App

When new version available:

### From Bolt.new

1. Export new version from Bolt.new
2. Close current app (Ctrl + C)
3. **BACKUP first!** (copy entire folder)
4. Extract new version over old folder
5. Type: `npm install` (in case dependencies changed)
6. Restart app

### From Git

```cmd
cd C:\SecuritySales
git pull origin main
npm install
npm start
```

---

## Uninstalling

If you need to remove the app:

1. Close app (Ctrl + C)
2. Delete folder: `C:\SecuritySales`
3. Remove startup items (if configured)
4. Remove firewall rule (if added)
5. Uninstall Node.js (optional - only if not using for other apps)

---

## Quick Reference Card

**Print this and keep near computer**:

```
════════════════════════════════════════
   SECURITY SALES APP - QUICK START
════════════════════════════════════════

START APP:
  1. Double-click "Start-SecuritySales.bat"
  2. Wait for "Server running" message
  3. Open browser: http://localhost:3000

STOP APP:
  • Close Command Prompt window
  • OR press Ctrl + C

BACKUP:
  Settings → Backup → "Create Backup"
  Save to external drive!

HELP:
  • App slow? Close and restart
  • Forgot password? Contact admin
  • Error? Take screenshot and note message

EMERGENCY:
  • App won't start? Restart computer
  • Lost data? Restore from last backup
════════════════════════════════════════
```

---

## System Check (Before Going Live)

- [ ] Node.js installed and verified
- [ ] App extracted to C:\SecuritySales
- [ ] `npm install` completed successfully
- [ ] Desktop shortcut created
- [ ] Can start app via shortcut
- [ ] Can access http://localhost:3000
- [ ] Changed admin password
- [ ] Configured company settings
- [ ] Uploaded company logo
- [ ] Created first product (test)
- [ ] Created first customer (test)
- [ ] Created test quotation
- [ ] PDF generates correctly
- [ ] Backup folder set up (external drive)
- [ ] Daily backup scheduled OR reminder set
- [ ] Bookmarked http://localhost:3000
- [ ] Staff trained on accessing app

**Ready to use!** 🎉

---

## Contact & Support

For technical issues:
1. Check Command Prompt for error messages
2. Try restarting app
3. Try restarting computer
4. Check backup and restore if needed
5. Contact system administrator

**Remember**: This is your data - backup daily!
