import adb from 'adbkit';
import { SMSService } from '../types';

export class ADBSMSService implements SMSService {
  private client = adb.createClient();

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const devices = await this.client.listDevices();
      if (devices.length === 0) {
        throw new Error('No Android device connected');
      }

      const device = devices[0];

      // Try different methods to send SMS directly
      const sendCommands = [
        // Method 1: Using service call isms (direct SMS sending)
        `service call isms 7 i32 0 s16 "com.android.mms.service" s16 "${phoneNumber}" s16 "null" s16 "${message}" s16 "null" s16 "null"`,
        'sleep 2',
        
        // Method 2: Using content provider
        `content insert --uri content://sms/sent --bind address:s:${phoneNumber} --bind body:s:"${message}"`,
        'sleep 2',
        
        // Method 3: Using sms manager through am command
        `am startservice -n com.android.phone/.PhoneInterfaceManager -a android.intent.action.SENDTO -d sms:${phoneNumber} --es sms_body "${message}"`,
        'sleep 2',
        
        // Method 4: Using broadcast with different intent
        `am broadcast -a android.provider.Telephony.SMS_SEND -n com.android.mms/.transaction.SmsReceiverService --es address "${phoneNumber}" --es body "${message}"`,
        'sleep 2'
      ];

      // Execute each command in sequence
      for (const cmd of sendCommands) {
        console.log('Executing:', cmd);
        const result = await this.client.shell(device.id, cmd);
        console.log('Result:', result);
        // Wait between commands
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }
} 