import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto/medical-records.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async findByPet(petId: string, pagination?: PaginationDto) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet || !pet.isActive) {
      throw new NotFoundException('Mascota no encontrada');
    }

    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = { petId };

    const [records, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        include: {
          veterinarian: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          attachments: true,
          appointment: {
            select: {
              id: true,
              dateTime: true,
              type: true,
            },
          },
        },
        orderBy: { recordDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return paginate(records, total, page, limit);
  }

  async findOne(id: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            dateOfBirth: true,
            gender: true,
            weight: true,
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            specialty: true,
            licenseNumber: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileUrl: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          },
        },
        appointment: {
          select: {
            id: true,
            dateTime: true,
            type: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException('Expediente no encontrado');
    }

    return record;
  }

  async create(dto: CreateMedicalRecordDto, veterinarianId: string) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet || !pet.isActive) {
      throw new NotFoundException('Mascota no encontrada');
    }

    let appointmentId: string | undefined;
    if (dto.appointmentId) {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: dto.appointmentId },
      });
      if (!appointment) {
        throw new NotFoundException('Cita no encontrada');
      }
      appointmentId = appointment.id;
    }

    return this.prisma.medicalRecord.create({
      data: {
        petId: dto.petId,
        veterinarianId,
        appointmentId,
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        diagnosis: dto.diagnosis,
        treatment: dto.treatment,
      },
      include: {
        pet: true,
        veterinarian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateMedicalRecordDto) {
    await this.findOne(id);

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        subjective: dto.subjective,
        objective: dto.objective,
        assessment: dto.assessment,
        plan: dto.plan,
        diagnosis: dto.diagnosis,
        treatment: dto.treatment,
      },
    });
  }

  async scheduleFollowUp(id: string, followUpDate: string, followUpNotes?: string) {
    await this.findOne(id);

    if (!followUpDate) {
      throw new BadRequestException('La fecha de seguimiento es requerida');
    }

    return this.prisma.medicalRecord.update({
      where: { id },
      data: {
        followUpDate: new Date(followUpDate),
        followUpNotes,
      },
      include: {
        pet: {
          select: { id: true, name: true, species: true, client: { select: { id: true, firstName: true, lastName: true, phone: true } } },
        },
        veterinarian: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getUpcomingFollowUps() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(23, 59, 59, 999);

    return this.prisma.medicalRecord.findMany({
      where: {
        followUpDate: { gte: today, lte: in7Days },
        dischargedAt: null,
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            client: { select: { id: true, firstName: true, lastName: true, phone: true } },
          },
        },
        veterinarian: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { followUpDate: 'asc' },
    });
  }
}
