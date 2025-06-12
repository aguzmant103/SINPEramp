"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adb_sms_service_1 = require("./services/adb-sms.service");
const types_1 = require("./types");
const net_1 = require("net");
const app = (0, express_1.default)();
const smsService = new adb_sms_service_1.ADBSMSService();
app.use(express_1.default.json());
app.post('/webhook/send-sms', async (req, res) => {
    try {
        const result = types_1.SMSRequestSchema.safeParse(req.body);
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
    }
    catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            error: 'Failed to send SMS',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Function to find an available port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)();
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Port is in use, try the next one
                server.close(() => {
                    resolve(findAvailablePort(startPort + 1));
                });
            }
            else {
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
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
