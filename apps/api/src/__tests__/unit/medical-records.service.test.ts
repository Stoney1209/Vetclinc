import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MedicalRecordsService } from '../../modules/medical-records/medical-records.service';
import { PrismaService } from '../../database/prisma.service';
import {
  createPrismaMock,
  createMockMedicalRecord,
  createMockPet,
  createMockAppointment,
} from '../mocks/prisma.mock';

describe('MedicalRecordsService', () => {
  let service: MedicalRecordsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalRecordsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MedicalRecordsService>(MedicalRecordsService);
  });

  describe('findByPet', () => {
    it('should return paginated medical records for a pet', async () => {
      const mockPet = createMockPet();
      const mockRecords = [createMockMedicalRecord()];

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.medicalRecord.findMany.mockResolvedValue(mockRecords);
      prismaMock.medicalRecord.count.mockResolvedValue(1);

      const result = await service.findByPet('test-pet-id');

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should throw NotFoundException if pet not found', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.findByPet('non-existent-pet')).rejects.toThrow(NotFoundException);
    });

    it('should handle pagination', async () => {
      const mockPet = createMockPet();

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.medicalRecord.findMany.mockResolvedValue([]);
      prismaMock.medicalRecord.count.mockResolvedValue(50);

      const result = await service.findByPet('test-pet-id', { page: 2, limit: 10 });

      expect(prismaMock.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
      expect(result.page).toBe(2);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(5);
    });

    it('should include related data in query', async () => {
      const mockPet = createMockPet();

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.medicalRecord.findMany.mockResolvedValue([]);
      prismaMock.medicalRecord.count.mockResolvedValue(0);

      await service.findByPet('test-pet-id');

      expect(prismaMock.medicalRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            veterinarian: expect.any(Object),
            attachments: true,
            appointment: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a medical record by id', async () => {
      const mockRecord = createMockMedicalRecord();
      prismaMock.medicalRecord.findUnique.mockResolvedValue(mockRecord);

      const result = await service.findOne('test-record-id');

      expect(result).toEqual(mockRecord);
      expect(prismaMock.medicalRecord.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-record-id' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if record not found', async () => {
      prismaMock.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      petId: 'test-pet-id',
      subjective: 'Patient appears healthy',
      objective: 'Vital signs normal',
      assessment: 'Good health',
      plan: 'Continue monitoring',
      diagnosis: 'Healthy',
      treatment: 'None required',
      appointmentId: 'test-appointment-id',
    };

    it('should create a medical record', async () => {
      const mockPet = createMockPet();
      const mockAppointment = createMockAppointment();
      const mockCreatedRecord = createMockMedicalRecord();

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.appointment.findUnique.mockResolvedValue(mockAppointment);
      prismaMock.medicalRecord.create.mockResolvedValue(mockCreatedRecord);

      const result = await service.create(createDto, 'test-doctor-id');

      expect(result).toEqual(mockCreatedRecord);
      expect(prismaMock.medicalRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          petId: 'test-pet-id',
          veterinarianId: 'test-doctor-id',
          appointmentId: 'test-appointment-id',
          subjective: 'Patient appears healthy',
        }),
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if pet not found', async () => {
      prismaMock.pet.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'test-doctor-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if appointment not found', async () => {
      const mockPet = createMockPet();

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.appointment.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto, 'test-doctor-id')).rejects.toThrow(NotFoundException);
    });

    it('should create record without appointmentId if not provided', async () => {
      const mockPet = createMockPet();
      const mockCreatedRecord = { ...createMockMedicalRecord(), appointmentId: null };

      prismaMock.pet.findUnique.mockResolvedValue(mockPet);
      prismaMock.medicalRecord.create.mockResolvedValue(mockCreatedRecord);

      const dtoWithoutAppointment = { ...createDto, appointmentId: undefined };

      await service.create(dtoWithoutAppointment, 'test-doctor-id');

      expect(prismaMock.medicalRecord.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          appointmentId: undefined,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update a medical record', async () => {
      const mockRecord = createMockMedicalRecord();
      const updatedRecord = { ...mockRecord, subjective: 'Updated subjective' };

      prismaMock.medicalRecord.findUnique.mockResolvedValue(mockRecord);
      prismaMock.medicalRecord.update.mockResolvedValue(updatedRecord);

      const result = await service.update('test-record-id', { subjective: 'Updated subjective' });

      expect(result.subjective).toBe('Updated subjective');
    });

    it('should throw NotFoundException if record not found', async () => {
      prismaMock.medicalRecord.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { subjective: 'Test' })).rejects.toThrow(NotFoundException);
    });

    it('should only update provided fields', async () => {
      const mockRecord = createMockMedicalRecord();

      prismaMock.medicalRecord.findUnique.mockResolvedValue(mockRecord);
      prismaMock.medicalRecord.update.mockResolvedValue(mockRecord);

      await service.update('test-record-id', { objective: 'Updated objective' });

      expect(prismaMock.medicalRecord.update).toHaveBeenCalledWith({
        where: { id: 'test-record-id' },
        data: expect.objectContaining({
          objective: 'Updated objective',
        }),
      });
    });
  });
});
