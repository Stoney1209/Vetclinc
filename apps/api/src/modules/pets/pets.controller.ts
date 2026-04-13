import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PetsService } from './pets.service';
import { CreatePetDto, UpdatePetDto, AddWeightDto, AddVaccinationDto, FilterPetsDto } from './dto/pets.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private petsService: PetsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all pets with pagination and filters' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'species', required: false })
  @ApiQuery({ name: 'clientId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query() filters: FilterPetsDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.petsService.findAll(filters, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pet by ID with full history' })
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(id);
  }

  @Post('client/:clientId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Create new pet for a client' })
  create(@Param('clientId') clientId: string, @Body() dto: CreatePetDto) {
    return this.petsService.create(clientId, dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN, Role.RECEPTIONIST)
  @ApiOperation({ summary: 'Update pet' })
  update(@Param('id') id: string, @Body() dto: UpdatePetDto) {
    return this.petsService.update(id, dto);
  }

  @Post(':id/weight')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Add weight record' })
  addWeight(@Param('id') id: string, @Body() dto: AddWeightDto) {
    return this.petsService.addWeight(id, dto);
  }

  @Get(':id/vaccinations')
  @ApiOperation({ summary: 'Get vaccination history' })
  getVaccinations(@Param('id') id: string) {
    return this.petsService.getVaccinations(id);
  }

  @Post(':id/vaccinations')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.VETERINARIAN)
  @ApiOperation({ summary: 'Add vaccination record' })
  addVaccination(@Param('id') id: string, @Body() dto: AddVaccinationDto) {
    return this.petsService.addVaccination(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate pet' })
  delete(@Param('id') id: string) {
    return this.petsService.delete(id);
  }
}
