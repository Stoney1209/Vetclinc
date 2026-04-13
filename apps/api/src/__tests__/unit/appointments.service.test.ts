import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentsService } from '../../modules/appointments/appointments.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationGateway } from '../../modules/notifications/notification.gateway';
import { NotificationService } from '../../modules/notifications/notification.service';
import {
  createPrismaMock,
  createMockAppointment,
  createMockPet,
  createMockUser,
} from '../mocks/prisma.mock';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let notificationGatewayMock: { emitAppointmentCreated: jest.Mock; emitAppointmentUpdated: jest.Mock; emitAppointmentDeleted: jest.Mock };
  let notificationServiceMock: { sendAppointmentConfirmation: jest.Mock };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    notificationGatewayMock = {
      emitAppointmentCreated: jest.fn(),
      emitAppointmentUpdated: jest.fn(),
      emitAppointmentDeleted: jest.fn(),
    };
    notificationServiceMock = {
      sendAppointmentConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: NotificationGateway, useValue: notificationGatewayMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  describe('findAll', () => {
    it('should return paginated appointments', async () => {
      const mockClient = { id: 'test-client-id', firstName: 'Juan', lastName: 'Pérez', phone: '5551234' };
      const mockPet = { id: 'test-pet-id', name: 'Fido', client: mockClient };
      const mockDoctor = { id: 'test-doctor-id', firstName: 'Dr', lastName: 'Smith', specialty: 'General' };
      const mockRoom = { id: 'test-room-id', name: 'Sala 1' };

      prismaMock.appointment.findMany.mockResolvedValue([{ ...createMockAppointment(), pet: mockPet, doctor: mockDoctor, room: mockRoom }]);
      prismaMock.appointment.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by date range', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      await service.findAll({ startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            dateTime: {
              gte: new Date('2024-01-01'),
              lte: new Date('2024-01-31'),
            },
          },
        }),
      );
    });

    it('should filter by doctorId', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      await service.findAll({ doctorId: 'doctor-123' });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ doctorId: 'doctor-123' }),
        }),
      );
    });

    it('should filter by status', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      await service.findAll({ status: 'SCHEDULED' });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'SCHEDULED' }),
        }),
      );
    });

    it('should handle pagination', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(50);

      const result = await service.findAll({}, { page: 2, limit: 10 });

      expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.page).toBe(2);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return an appointment by id', async () => {
      const mockAppointment = createMockAppointment();
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await service.findOne('test-appointment-id');

      expect(result).toEqual(mockAppointment);
      expect(prismaMock.appointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-appointment-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      petId: 'test-pet-id',
      doctorId: 'test-doctor-id',
      dateTime: '2024-03-15T10:00:00Z',
      type: 'CONSULTATION' as const,
      duration: 30,
      notes: 'Test notes',
    };

    it('should create an appointment', async () => {
      const mockPet = createMockPet();
      const mockDoctor = createMockUser({ role: 'VETERINARIAN' });
      const mockCreatedAppointment = createMockAppointment();

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.user.findUnique.mockResolvedValue(mockDoctor);
      prismaMock.appointment.create.mockResolvedValue(mockCreatedAppointment);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedAppointment);
      expect(notificationGatewayMock.emitAppointmentCreated).toHaveBeenCalledWith(mockCreatedAppointment);
    });

    it('should throw BadRequestException if pet not found', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if doctor not found', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(createMockPet());
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if room not found', async () => {
      const mockPet = createMockPet();
      const mockDoctor = createMockUser({ role: 'VETERINARIAN' });

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.user.findUnique.mockResolvedValue(mockDoctor);
      prismaMock.room.findUnique.mockResolvedValue(null);

      await expect(service.create({ ...createDto, roomId: 'non-existent-room' })).rejects.toThrow(BadRequestException);
    });

    it('should use color map for type if no colorCode provided', async () => {
      const mockPet = createMockPet();
      const mockDoctor = createMockUser({ role: 'VETERINARIAN' });
      const mockCreatedAppointment = { ...createMockAppointment(), type: 'VACCINATION', colorCode: '#22c55e' };

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.user.findUnique.mockResolvedValue(mockDoctor);
      prismaMock.appointment.create.mockResolvedValue(mockCreatedAppointment);

      await service.create({ ...createDto, type: 'VACCINATION' });

      expect(prismaMock.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ colorCode: '#22c55e' }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update an appointment', async () => {
      const mockAppointment = createMockAppointment();
      const updatedAppointment = { ...mockAppointment, notes: 'Updated notes' };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.appointment.update.mockResolvedValue(updatedAppointment);

      const result = await service.update('test-appointment-id', { notes: 'Updated notes' });

      expect(result.notes).toBe('Updated notes');
      expect(notificationGatewayMock.emitAppointmentUpdated).toHaveBeenCalled();
    });

    it('should throw NotFoundException if appointment not found', async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { notes: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete an appointment by setting status to CANCELLED', async () => {
      const mockAppointment = createMockAppointment();
      const cancelledAppointment = { ...mockAppointment, status: 'CANCELLED' };

      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.appointment.update.mockResolvedValue(cancelledAppointment);

      const result = await service.delete('test-appointment-id');

      expect(result.status).toBe('CANCELLED');
      expect(prismaMock.appointment.update).toHaveBeenCalledWith({
        where: { id: 'test-appointment-id' },
        data: { status: 'CANCELLED' },
      });
    });

    it('should throw NotFoundException if appointment not found', async () => {
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCalendar', () => {
    it('should call findAll with date range', async () => {
      prismaMock.appointment.findMany.mockResolvedValue([]);
      prismaMock.appointment.count.mockResolvedValue(0);

      await service.getCalendar(new Date('2024-01-01'), new Date('2024-01-31'));

      expect(prismaMock.appointment.findMany).toHaveBeenCalled();
    });
  });
});
