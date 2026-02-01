# 🚀 TunnelDrop - Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Modern browser (Chrome recommended)

## Installation

### 1. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ..
npm install
```

### 2. Start Development Servers

**Terminal 1 - Signaling Server:**
```bash
cd server
npm start
```
Output: `🚀 Signaling server running on port 3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Output: `➜ Local: http://localhost:5173/`

## Testing File Transfer

### Test 1: Same Computer (2 Browser Windows)

1. Open http://localhost:5173 in **TWO browser windows** (or tabs)

2. **Window 1 (Sender):**
   - Click "Send File"
   - Select any file from your computer
   - Note the 4-digit code (e.g., `4829`)
   - See the QR code displayed

3. **Window 1 (Receiver):**
   - Click "Receive File"
   - Enter the 4-digit code
   - Click "Accept" when file info appears
   - File downloads automatically

### Test 2: Different Devices (QR Code)

1. **Desktop:**
   - Click "Send File"
   - Select file
   - Display QR code

2. **Mobile:**
   - Open http://[your-ip]:5173 on phone
   - Click "Receive File"
   - Scan QR code with camera
   - Accept transfer

## Features to Try

✅ **Dark Mode** - Click moon icon in header  
✅ **Large Files** - Try 50MB+ files  
✅ **Progress Tracking** - Watch real-time speed  
✅ **Cancellation** - Click cancel during transfer  
✅ **Error Handling** - Enter wrong code  

## Troubleshooting

**"Connection failed"**
- Ensure both servers are running
- Check firewall isn't blocking localhost
- Try incognito/private browsing mode

**"Invalid code"**
- Verify 4-digit code is correct
- Codes expire after 5 minutes
- Make sure sender is still waiting

**Slow transfers**
- Close other browser tabs
- Check network connection
- For local testing, both windows should be on same machine

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io
- **P2P:** WebRTC (simple-peer)
- **State:** Zustand

## Next Steps

1. ✅ Test file transfer
2. ✅ Try dark mode
3. ✅ Test on mobile
4. 📖 Read full [README.md](file:///d:/Share.com/README.md)
5. 🚀 Deploy to production

---

**🎉 Enjoy instant P2P file sharing with TunnelDrop!**
