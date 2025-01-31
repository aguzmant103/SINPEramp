import express, { Request, Response } from 'express';
import { ADBSMSService } from './services/adb-sms.service';
import { SMSRequestSchema } from './types';
import { createServer } from 'net';

const app = express();
const smsService = new ADBSMSService();

app.use(express.json());

app.post('/webhook/send-sms', async (req: Request, res: Response) => {
  try {
    const result = SMSRequestSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: result.error.issues 
      });
    }

    const { phoneNumber, amount, targetPhone } = result.data;
    const message = `PASE ${amount} ${phoneNumber}`;

    await smsService.sendSMS(targetPhone, message);
    
    res.json({ 
      success: true, 
      message: 'SMS sent successfully',
      details: {
        to: targetPhone,
        content: message
      }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      error: 'Failed to send SMS',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Function to find an available port
function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        server.close(() => {
          resolve(findAvailablePort(startPort + 1));
        });
      } else {
        reject(err);
      }
    });

    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });
  });
}

// Start the server with automatic port selection
const startServer = async () => {
  try {
    const port = await findAvailablePort(3000);
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      console.log(`Webhook endpoint: POST http://localhost:${port}/webhook/send-sms`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 