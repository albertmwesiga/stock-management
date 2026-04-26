import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class FleetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FleetGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_director')
  handleJoinDirector(@MessageBody() data: any) {
    this.logger.log('Director joined live dashboard');
  }

  emitJourneyStarted(journey: any) {
    this.server.emit('journey:started', journey);
  }

  emitJourneyCompleted(journey: any) {
    this.server.emit('journey:completed', journey);
  }

  emitJourneyStopAdded(stop: any) {
    this.server.emit('journey:stop_added', stop);
  }

  emitFuelRefill(refill: any) {
    this.server.emit('fuel:refill', refill);
  }

  emitStockUpdate(entry: any) {
    this.server.emit('stock:update', entry);
  }

  emitSaleRecord(sale: any) {
    this.server.emit('sales:record', sale);
  }
}
