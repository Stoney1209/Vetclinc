import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePetDto, UpdatePetDto, AddWeightDto, AddVaccinationDto, FilterPetsDto } from './dto/pets.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: FilterPetsDto, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PetWhereInput = {
      isActive: true,
    };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { species: { contains: filters.search, mode: 'insensitive' } },
        { breed: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.species) {
      where.species = filters.species;
    }

    if (filters?.clientId) {
      where.clientId = filters.clientId;
    }

    const [pets, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pet.count({ where }),
    ]);

    return paginate(pets, total, page, limit);
  }

  async findOne(id: string) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vaccinations: {
          orderBy: { applicationDate: 'desc' },
        },
        weightHistory: {
          orderBy: { recordedAt: 'desc' },
        },
        medicalRecords: {
          orderBy: { recordDate: 'desc' },
          take: 5,
        },
      },
    });

    if (!pet || !pet.isActive) {
      throw new NotFoundException('Mascota no encontrada');
    }

    return pet;
  }

  async create(clientId: string, dto: CreatePetDto) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client || !client.isActive) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.prisma.pet.create({
      data: {
        ...dto,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdatePetDto) {
    await this.findOne(id);

    return this.prisma.pet.update({
      where: { id },
      data: dto,
    });
  }

  async addWeight(id: string, dto: AddWeightDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      const weight = await tx.weightHistory.create({
        data: {
          petId: id,
          weight: dto.weight,
          notes: dto.notes,
        },
      });

      await tx.pet.update({
        where: { id },
        data: { weight: dto.weight },
      });

      return weight;
    });
  }

  async addVaccination(id: string, dto: AddVaccinationDto) {
    await this.findOne(id);

    return this.prisma.vaccination.create({
      data: {
        petId: id,
        vaccineName: dto.vaccineName,
        batch: dto.batch,
        applicationDate: dto.applicationDate,
        nextDueDate: dto.nextDueDate,
        veterinarian: dto.veterinarian,
        notes: dto.notes,
      },
    });
  }

  async getVaccinations(id: string) {
    await this.findOne(id);

    return this.prisma.vaccination.findMany({
      where: { petId: id },
      orderBy: { applicationDate: 'desc' },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.pet.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
