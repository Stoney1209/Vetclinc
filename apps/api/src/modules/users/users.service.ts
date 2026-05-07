import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserCommonService } from '../common/services/user-common.service';
import { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private userCommonService: UserCommonService,
  ) {}

  async findAll(pagination?: PaginationDto) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = { isActive: true };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: this.userCommonService.getUserSelectFields(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginate(users, total, page, limit);
  }

  async findOne(id: string) {
    return this.userCommonService.findUserById(id);
  }

  async findVeterinarians() {
    return this.prisma.user.findMany({
      where: {
        role: 'VETERINARIAN',
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialty: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    await this.userCommonService.validateUniqueEmail(dto.email);
    const hashedPassword = await this.userCommonService.hashPassword(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      select: this.userCommonService.getPublicUserSelectFields(),
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: this.userCommonService.getPublicUserSelectFields(),
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
