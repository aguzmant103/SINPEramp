# SMS Webhook Server

A Node.js/TypeScript server that sends SMS messages through a connected Android device using ADB (Android Debug Bridge).

## Features

- Webhook endpoint for sending SMS messages
- Direct integration with Android's SMS service
- Works without UI interaction
- Supports custom message formatting
- Automatic port selection

## Prerequisites

1. Node.js 16+ installed
2. Android Debug Bridge (ADB) installed:
   - macOS: `brew install android-platform-tools`
   - Linux: `sudo apt-get install android-tools-adb`
   - Windows: Download from Android SDK Platform Tools

3. Android device setup:
   - USB debugging enabled:
     1. Go to Settings > About Phone
     2. Tap "Build number" 7 times to enable Developer Options
     3. Go to Settings > System > Developer Options
     4. Enable "USB debugging"
   - Device connected via USB
   - Authorized for debugging (accept the prompt on your phone)

## Installation

```bash
npm install
```

## Usage

1. Start the server:
```bash
npm run dev
```

2. Send an SMS via webhook:
```bash
curl -X POST http://localhost:3000/webhook/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "88869436",
    "amount": 1000
  }'
```

The server will format the message as: `PASE {amount} {phoneNumber}`

### Default Values
- `phoneNumber`: "88869436"
- `amount`: 650
- Target phone (recipient): "70701222"

## How It Works

The server uses Android's system services to send SMS messages directly through ADB. This approach:
- Bypasses UI interaction
- Works even when the phone is in a different screen
- Is more reliable than UI automation

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Troubleshooting

1. Check ADB connection:
```bash
adb devices
```
You should see your device listed.

2. If the device is not recognized:
- Ensure USB debugging is enabled
- Try unplugging and replugging the device
- Accept the USB debugging authorization prompt on your phone

3. If SMS fails to send:
- Check that the phone has cellular service
- Verify the phone number format
- Ensure the Android device has permission to send SMS 