declare module 'adbkit' {
  interface Device {
    id: string;
  }

  interface Client {
    createClient(): Client;
    listDevices(): Promise<Device[]>;
    shell(deviceId: string, command: string): Promise<string>;
  }

  const adb: {
    createClient(): Client;
  };

  export default adb;
} 