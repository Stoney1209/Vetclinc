import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Get,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const maxFileSize = 10 * 1024 * 1024; // 10MB para Cloudinary

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('medical-record/:recordId')
  @ApiOperation({ summary: 'Subir adjunto a expediente médico' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('Tipo de archivo no permitido'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadMedicalRecordFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('recordId') recordId: string,
  ) {
    return this.uploadsService.uploadMedicalRecordFile(file, recordId);
  }

  @Post('pet/:petId/photo')
  @ApiOperation({ summary: 'Subir foto de mascota' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(ext) || !allowedMimeTypes.includes(file.mimetype)) {
          return callback(new Error('Tipo de archivo no permitido'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadPetPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Param('petId') petId: string,
  ) {
    return this.uploadsService.uploadPetPhoto(file, petId);
  }
}
