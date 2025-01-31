import { z } from 'zod';

export const SMSRequestSchema = z.object({
  phoneNumber: z.string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .default('88869436'),
  amount: z.number()
    .positive('Amount must be positive')
    .default(650),
  targetPhone: z.string()
    .regex(/^\d+$/, 'Target phone must contain only digits')
    .default('70701222')
});

export type SMSRequest = z.infer<typeof SMSRequestSchema>;

export interface SMSService {
  sendSMS(phoneNumber: string, message: string): Promise<void>;
} 