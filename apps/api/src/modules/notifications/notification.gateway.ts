import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationGateway');

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      this.logger.warn(`Client ${client.id} rejected: no token`);
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Client ${client.id} rejected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(@ConnectedSocket() client: Socket, room: string) {
    const allowedRooms = ['appointments', 'sales', 'inventory', 'medical-records', 'clients'];
    if (!allowedRooms.includes(room)) {
      return { success: false, error: 'Sala no permitida' };
    }
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { success: true, room };
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { success: true, room };
  }

  emitAppointmentCreated(appointment: any) {
    this.server.to('appointments').emit('appointment:created', appointment);
    this.logger.log(`Emitted appointment:created for appointment ${appointment.id}`);
  }

  emitAppointmentUpdated(appointment: any) {
    this.server.to('appointments').emit('appointment:updated', appointment);
    this.logger.log(`Emitted appointment:updated for appointment ${appointment.id}`);
  }

  emitAppointmentDeleted(appointmentId: string) {
    this.server.to('appointments').emit('appointment:deleted', { id: appointmentId });
    this.logger.log(`Emitted appointment:deleted for appointment ${appointmentId}`);
  }

  emitLowStockAlert(product: any) {
    this.server.to('inventory').emit('stock:low', product);
    this.logger.log(`Emitted stock:low alert for product ${product.id}`);
  }

  emitVaccinationReminder(pet: any, vaccination: any) {
    this.server.to('clients').emit('vaccination:reminder', { pet, vaccination });
    this.logger.log(`Emitted vaccination:reminder for pet ${pet.id}`);
  }

  emitSaleCreated(sale: any) {
    this.server.to('sales').emit('sale:created', sale);
    this.logger.log(`Emitted sale:created for sale ${sale.id}`);
  }

  emitMedicalRecordCreated(record: any) {
    this.server.to('medical-records').emit('record:created', record);
    this.logger.log(`Emitted record:created for medical record ${record.id}`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
