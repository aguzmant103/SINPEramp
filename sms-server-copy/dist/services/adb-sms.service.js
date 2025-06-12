"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADBSMSService = void 0;
const adbkit_1 = __importDefault(require("adbkit"));
/**
 * SMS Service implementation using Android Debug Bridge (ADB)
 * This service uses Android's system services to send SMS messages directly,
 * without requiring UI interaction.
 *
 * Requirements:
 * - Android device connected via USB
 * - USB debugging enabled on the device
 * - ADB installed on the host machine
 *
 * The service uses the 'service call isms' command which directly interfaces
 * with Android's telephony services to send SMS messages.
 */
class ADBSMSService {
    constructor() {
        this.client = adbkit_1.default.createClient();
    }
    async sendSMS(phoneNumber, message) {
        try {
            const devices = await this.client.listDevices();
            if (devices.length === 0) {
                throw new Error('No Android device connected');
            }
            const device = devices[0];
            // Send SMS using Android's SMS service directly
            // This method bypasses UI interaction and works even when the phone is in a different screen
            // The command parameters are:
            // - isms: Android's internal SMS service
            // - 7: Operation code for sending SMS
            // - i32 0: Message priority
            // - s16: String parameter type (16-bit)
            // - Additional parameters: service name, phone number, message, etc.
            const command = `service call isms 7 i32 0 s16 "com.android.mms.service" s16 "${phoneNumber}" s16 "null" s16 "${message}" s16 "null" s16 "null"`;
            console.log('Sending SMS via system service...');
            const result = await this.client.shell(device.id, command);
            console.log('Service call result:', result);
            // Wait for the command to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }
}
exports.ADBSMSService = ADBSMSService;
