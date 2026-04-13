import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePrescriptionDto } from './dto/prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePrescriptionDto, veterinarianId: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: dto.medicalRecordId },
    });
    if (!record) {
      throw new NotFoundException('Expediente médico no encontrado');
    }

    return this.prisma.prescription.create({
      data: {
        medicalRecordId: dto.medicalRecordId,
        veterinarianId,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            productName: item.productName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
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

  async findByMedicalRecord(medicalRecordId: string) {
    return this.prisma.prescription.findMany({
      where: { medicalRecordId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        veterinarian: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                client: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescripción no encontrada');
    }

    return prescription;
  }
}
