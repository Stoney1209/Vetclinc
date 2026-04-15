import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaService } from '../../database/prisma.service';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn('⚠️ Cloudinary no está configurado correctamente. Las subidas de archivos fallarán.');
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    this.logger.log('✅ Cloudinary configurado correctamente');
  }

  async uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `vetclinic/${folder}` },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadPetPhoto(file: Express.Multer.File | undefined, petId: string) {
    if (!file) return null;

    const url = await this.uploadToCloudinary(file, 'pets');
    
    await this.prisma.pet.update({
      where: { id: petId },
      data: { photoUrl: url },
    });

    return { url };
  }

  async uploadAttachment(file: Express.Multer.File, medicalRecordId: string) {
    const url = await this.uploadToCloudinary(file, 'medical-records');

    const attachment = await this.prisma.attachment.create({
      data: {
        medicalRecordId,
        fileUrl: url,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      },
    });

    return attachment;
  }
}
