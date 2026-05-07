import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserCommonService {
  constructor(private prisma: PrismaService) {}

  async validateUniqueEmail(email: string, excludeId?: string) {
    const where = excludeId 
      ? { email, id: { not: excludeId } }
      : { email };

    const existingUser = await this.prisma.user.findFirst({ where });
    
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
        licenseNumber: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  getUserSelectFields() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      specialty: true,
      licenseNumber: true,
      isActive: true,
      createdAt: true,
    };
  }

  getPublicUserSelectFields() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    };
  }
}
