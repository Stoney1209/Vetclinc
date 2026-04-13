import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/clients.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClientWhereInput = {
      isActive: true,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        include: {
          pets: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              species: true,
              breed: true,
              weight: true,
              gender: true,
              medicalRecords: {
                where: { dischargedAt: null },
                select: { id: true },
                orderBy: { recordDate: 'desc' },
                take: 1,
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return paginate(clients, total, page, limit);
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        pets: {
          where: { isActive: true },
          include: {
            vaccinations: {
              orderBy: { applicationDate: 'desc' },
            },
            weightHistory: {
              orderBy: { recordedAt: 'desc' },
              take: 10,
            },
          },
        },
      },
    });

    if (!client || !client.isActive) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async create(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOne(id);

    return this.prisma.client.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
