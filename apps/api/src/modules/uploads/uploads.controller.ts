import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Response } from 'express';
import { mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadsService } from './uploads.service';

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'];
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const maxFileSize = 5 * 1024 * 1024;
const uploadBasePath = join(process.cwd(), 'uploads');

mkdirSync(join(uploadBasePath, 'medical-records'), { recursive: true });

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('medical-record/:recordId')
  @ApiOperation({ summary: 'Upload attachment to medical record' })
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
      storage: diskStorage({
        destination: join(uploadBasePath, 'medical-records'),
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname).toLowerCase();
        if (!imageExtensions.includes(ext)) {
          callback(new BadRequestException('Tipo de archivo no permitido'), false);
          return;
        }
        if (!allowedMimeTypes.includes(file.mimetype)) {
          callback(new BadRequestException('Tipo MIME no permitido'), false);
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: maxFileSize },
    }),
  )
  async uploadMedicalRecordFile(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Param('recordId') recordId: string,
  ) {
    return this.uploadsService.uploadMedicalRecordFile(file, recordId);
  }

  @Get('medical-records/:filename')
  @ApiOperation({ summary: 'Get medical record attachment' })
  async getMedicalRecordFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.uploadsService.getMedicalRecordFile(filename, res);
  }
}
