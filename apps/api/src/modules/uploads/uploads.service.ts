import { Injectable, BadRequestException } from '@nestjs/common';
import { join, resolve, extname } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import { StreamableFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Response } from 'express';

const uploadBasePath = join(process.cwd(), 'uploads');

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {
    if (!existsSync(uploadBasePath)) {
      mkdirSync(uploadBasePath, { recursive: true });
    }
  }

  async uploadMedicalRecordFile(file: Express.Multer.File | undefined, recordId: string) {
    if (!file) {
      throw new BadRequestException('Archivo requerido');
    }

    const record = await this.prisma.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new BadRequestException('Expediente no encontrado');
    }

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileUrl: `/api/uploads/medical-records/${file.filename}`,
        fileType: file.mimetype,
        fileSize: file.size,
        medicalRecordId: recordId,
      },
    });
  }

  getMedicalRecordFile(filename: string, res: Response) {
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Nombre de archivo inválido');
    }

    const filePath = join(uploadBasePath, 'medical-records', filename);
    const resolvedPath = resolve(filePath);

    if (!resolvedPath.startsWith(resolve(uploadBasePath))) {
      throw new BadRequestException('Ruta de archivo no permitida');
    }

    if (!existsSync(resolvedPath)) {
      throw new BadRequestException('Archivo no encontrado');
    }

    const file = createReadStream(filePath);
    const ext = extname(filename).toLowerCase();
    const contentType = ext === '.pdf' ? 'application/pdf' : `image/${ext.slice(1)}`;

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${filename}"`,
    });

    return new StreamableFile(file);
  }
}
