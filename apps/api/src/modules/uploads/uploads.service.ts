import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `vetclinic/${folder}`, resource_type: 'auto' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result!);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
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

    try {
      const result = await this.uploadToCloudinary(file, 'medical-records');

      return this.prisma.attachment.create({
        data: {
          fileName: file.originalname,
          fileUrl: result.secure_url,
          fileType: file.mimetype,
          fileSize: file.size,
          medicalRecordId: recordId,
        },
      });
    } catch (error) {
      throw new BadRequestException('Error al subir archivo a Cloudinary');
    }
  }

  async uploadPetPhoto(file: Express.Multer.File | undefined, petId: string) {
    if (!file) {
      throw new BadRequestException('Foto requerida');
    }

    const pet = await this.prisma.pet.findUnique({
      where: { id: petId },
    });

    if (!pet) {
      throw new BadRequestException('Mascota no encontrada');
    }

    try {
      const result = await this.uploadToCloudinary(file, 'pets');

      return this.prisma.pet.update({
        where: { id: petId },
        data: { photoUrl: result.secure_url },
      });
    } catch (error) {
      throw new BadRequestException('Error al subir foto a Cloudinary');
    }
  }
}
