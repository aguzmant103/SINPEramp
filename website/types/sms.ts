import { z } from 'zod';

export const SMSRequestSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  amount: z.number()
    .positive('Amount must be positive')
});

export type SMSRequest = z.infer<typeof SMSRequestSchema>;

export interface SMSService {
  sendSMS(phoneNumber: string, message: string): Promise<void>;
} 