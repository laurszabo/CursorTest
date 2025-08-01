# 🚀 CogniRogue - Build Executable Instructions

## 📦 **Distribution Options Overview**

### **Option 1: Standalone HTML File (✅ Ready)**
- **File**: `cognirogue-standalone.html`
- **Distribution**: Email, USB, network share
- **Requirements**: Any web browser
- **Size**: ~45KB single file

### **Option 2: GitHub Pages (✅ Ready)**  
- **URL**: `https://laurszabo.github.io/CursorTest/`
- **Distribution**: Share link across organization
- **Requirements**: Internet access
- **Perfect for**: Company-wide distribution

### **Option 3: Electron Desktop App (⚙️ Build Required)**

## 💻 **Building Desktop Executables**

### **Prerequisites**
1. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)
2. **Open Terminal/Command Prompt** in your game directory

### **Step-by-Step Build Process**

#### **1. Install Dependencies**
```bash
npm install
```

#### **2. Test the App**
```bash
npm start
```
This opens the game in a desktop window to test it works.

#### **3. Build Executables**

**For Windows:**
```bash
npm run build-win
```
Creates: `dist/CogniRogue Setup 1.0.0.exe`

**For macOS:**
```bash
npm run build-mac  
```
Creates: `dist/CogniRogue-1.0.0.dmg`

**For Linux:**
```bash
npm run build-linux
```
Creates: `dist/CogniRogue-1.0.0.AppImage`

**For All Platforms:**
```bash
npm run dist
```
Creates executables for Windows, macOS, and Linux.

### **📁 Output Files**
After building, find your executables in the `dist/` folder:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image  
- **Linux**: `.AppImage` portable app

## 🔧 **Alternative: Simple Executable (No Node.js)**

If you don't want to install Node.js, use these online tools:

### **1. Web2Executable**
- Upload your `cognirogue-standalone.html`
- Download as Windows/Mac/Linux app
- Website: [Web2Executable Online](https://github.com/jyapayne/Web2Executable)

### **2. Nativefier (Command Line)**
```bash
npx nativefier --name "CogniRogue" "file:///path/to/cognirogue-standalone.html"
```

### **3. Tauri (Rust-based, smaller file size)**
- More complex setup but creates smaller executables
- Great for production distribution

## 📤 **Recommended Distribution Methods**

### **For Internal Cognizant Teams:**

#### **🌐 Web Distribution (Easiest)**
1. **GitHub Pages**: Share `https://laurszabo.github.io/CursorTest/`
2. **Internal Server**: Host `cognirogue-standalone.html` on company server
3. **SharePoint**: Upload HTML file to SharePoint document library

#### **💾 File Distribution**
1. **Email**: Attach `cognirogue-standalone.html` (45KB)
2. **Network Drive**: Place file on shared company drive  
3. **USB/Portal**: Copy file for offline distribution

#### **💻 Executable Distribution (Most Professional)**
1. **Build Windows .exe** for company laptops
2. **Package with installer** for easy deployment
3. **Code sign** for security compliance
4. **Deploy via SCCM/Intune** for enterprise distribution

## 🏢 **Enterprise Deployment Options**

### **IT Department Integration**
- **Software Center**: Add to company software catalog
- **Group Policy**: Deploy via Active Directory
- **Mobile Device Management**: Push to company devices
- **App Store**: Internal company app store

### **Security Considerations**
- **Code Signing**: Sign executables with company certificate
- **Antivirus Whitelist**: Add to corporate antivirus exceptions
- **Network Security**: Host on internal servers only
- **User Permissions**: Standard user installation support

## 🎯 **Quick Start for Cognizant Teams**

### **Immediate Options (No Technical Setup)**
1. **Right now**: Share `cognirogue-standalone.html` via email
2. **5 minutes**: Enable GitHub Pages and share web link
3. **1 hour**: Build .exe files for Windows distribution

### **Professional Deployment**
1. **Contact IT**: Request internal hosting
2. **Build signed executables**: For security compliance  
3. **Create installer package**: For automated deployment
4. **Distribute via enterprise tools**: SCCM, Intune, etc.

## 🔍 **File Sizes**
- **HTML file**: 45KB (perfect for email)
- **Windows .exe**: ~150MB (includes Chromium engine)
- **macOS .dmg**: ~180MB (includes Chromium engine)
- **Linux AppImage**: ~170MB (includes Chromium engine)

## ⚡ **Quick Commands Summary**

```bash
# Install and test
npm install && npm start

# Build for current platform
npm run build

# Build for all platforms  
npm run dist

# Just run the game locally
open cognirogue-standalone.html
```

## 🎮 **Game Features for Corporate Environment**
- **No network required** (after initial download)
- **Safe content** (programming humor, educational)
- **Short play sessions** (perfect for breaks)
- **No personal data collection**
- **Runs in any modern browser**
- **Corporate-friendly theme** (Cognizant branding)

Happy debugging! 🐛➡️💀