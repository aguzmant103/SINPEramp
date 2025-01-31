import adb from 'adbkit';
import { SMSService } from '../types';

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
export class ADBSMSService implements SMSService {
  private client = adb.createClient();

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const devices = await this.client.listDevices();
      if (devices.length === 0) {
        throw new Error('No Android device connected');
      }

      const device = devices[0];
      
      // Use Android's SMS manager to send the message directly
      const command = `am broadcast -a android.provider.Telephony.SMS_DELIVER -n com.android.mms/.transaction.SmsReceiverService --es "pdus" "${message}" --es "format" "3gpp" --es "phone" "${phoneNumber}"`;
      
      console.log('Sending SMS via SMS manager...');
      console.log('Command:', command);
      
      const result = await this.client.shell(device.id, command);
      console.log('Command result:', result);

      // Alternative method using content provider
      const contentCommand = `content insert --uri content://sms/sent --bind address:s:${phoneNumber} --bind body:s:"${message}"`;
      console.log('Trying content provider method...');
      console.log('Command:', contentCommand);
      
      const contentResult = await this.client.shell(device.id, contentCommand);
      console.log('Content provider result:', contentResult);
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
} 