# SMS Webhook Server

A simple webhook server that sends SMS messages through a connected Android device using ADB.

## Prerequisites

1. Node.js 16+ installed
2. Android Debug Bridge (ADB) installed
3. An Android device connected via USB with:
   - USB debugging enabled
   - Device connected and authorized

## Setup

1. Install ADB if you haven't already:
   - macOS: `brew install android-platform-tools`
   - Linux: `sudo apt-get install android-tools-adb`
   - Windows: Download from Android SDK Platform Tools

2. Enable USB debugging on your Android device:
   - Go to Settings > About Phone
   - Tap "Build number" 7 times to enable Developer Options
   - Go to Settings > System > Developer Options
   - Enable "USB debugging"

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

Send a POST request to the webhook endpoint:

```bash
curl -X POST http://localhost:3000/webhook/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "amount": 100.50
  }'
```

## Testing ADB Connection

To verify your device is properly connected:

```bash
adb devices
```

You should see your device listed in the output.

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server 