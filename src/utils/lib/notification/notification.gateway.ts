import WebSocket, { Server } from 'ws';

class NotificationGateway {
  private readonly wss: Server;

  constructor() {
    this.wss = new WebSocket.Server({ noServer: true });
  }

  public sendNotification(message: string): void {
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
export default NotificationGateway;
