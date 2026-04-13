import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from '../../modules/auth/dto/auth.dto';
import { CreateUserDto } from '../../modules/users/dto/users.dto';
import { CreateClientDto } from '../../modules/clients/dto/clients.dto';
import { CreateAppointmentDto } from '../../modules/appointments/dto/appointments.dto';

describe('DTO Validation', () => {
  describe('LoginDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid email', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'not-an-email',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with empty password', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: '',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with missing fields', async () => {
      const dto = plainToInstance(LoginDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBe(2);
    });
  });

  describe('CreateUserDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateUserDto, {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with weak password', async () => {
      const dto = plainToInstance(CreateUserDto, {
        email: 'newuser@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail validation with invalid email', async () => {
      const dto = plainToInstance(CreateUserDto, {
        email: 'invalid-email',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'ADMIN',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToInstance(CreateUserDto, {
        email: 'newuser@example.com',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('CreateClientDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateClientDto, {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: 'juan@example.com',
        address: 'Calle 123',
        rfc: 'XAXX010101XXX',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid phone format', async () => {
      const dto = plainToInstance(CreateClientDto, {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: 'abc',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToInstance(CreateClientDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should pass validation without optional fields', async () => {
      const dto = plainToInstance(CreateClientDto, {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('CreateAppointmentDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToInstance(CreateAppointmentDto, {
        petId: 'pet-123',
        doctorId: 'doctor-123',
        dateTime: '2024-12-25T10:00:00.000Z',
        duration: 30,
        type: 'CONSULTATION',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid type', async () => {
      const dto = plainToInstance(CreateAppointmentDto, {
        petId: 'pet-123',
        doctorId: 'doctor-123',
        dateTime: '2024-12-25T10:00:00.000Z',
        duration: 30,
        type: 'INVALID_TYPE',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with missing required fields', async () => {
      const dto = plainToInstance(CreateAppointmentDto, {});
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});
