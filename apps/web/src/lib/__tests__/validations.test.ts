import { clientSchema, defaultClientValues } from '../validations/client';
import { petSchema, defaultPetValues, speciesOptions, genderOptions } from '../validations/pet';

describe('clientSchema', () => {
  describe('datos válidos', () => {
    it('debe aceptar un cliente con todos los campos requeridos', () => {
      const validClient = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
      };

      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('debe aceptar un cliente con campos opcionales vacíos', () => {
      const validClient = {
        firstName: 'María',
        lastName: 'García',
        phone: '5551234567',
        email: '',
        address: '',
        rfc: '',
      };

      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('debe aceptar un cliente con email válido', () => {
      const validClient = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: 'juan@test.com',
      };

      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it('debe aceptar email vacío', () => {
      const client = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: '',
      };

      const result = clientSchema.safeParse(client);
      expect(result.success).toBe(true);
    });
  });

  describe('datos inválidos', () => {
    it('debe rechazar sin nombre', () => {
      const invalidClient = {
        firstName: '',
        lastName: 'Pérez',
        phone: '5551234567',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('debe rechazar sin apellido', () => {
      const invalidClient = {
        firstName: 'Juan',
        lastName: '',
        phone: '5551234567',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('debe rechazar teléfono con menos de 10 dígitos', () => {
      const invalidClient = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '123',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('debe rechazar teléfono con letras', () => {
      const invalidClient = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: 'abc1234567',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('debe rechazar email inválido', () => {
      const invalidClient = {
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '5551234567',
        email: 'no-es-email',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it('debe rechazar nombre muy largo (>50 chars)', () => {
      const invalidClient = {
        firstName: 'A'.repeat(51),
        lastName: 'Pérez',
        phone: '5551234567',
      };

      const result = clientSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });
  });

  describe('valores por defecto', () => {
    it('debe tener todos los campos inicializados', () => {
      expect(defaultClientValues).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        rfc: '',
      });
    });
  });
});

describe('petSchema', () => {
  describe('datos válidos', () => {
    it('debe aceptar mascota con campos requeridos', () => {
      const validPet = {
        name: 'Firulais',
        species: 'Perro',
      };

      const result = petSchema.safeParse(validPet);
      expect(result.success).toBe(true);
    });

    it('debe aceptar mascota con todos los campos', () => {
      const validPet = {
        name: 'Firulais',
        species: 'Perro',
        breed: 'Labrador',
        gender: 'Macho',
        weight: '15.5',
        microchip: '123456789',
      };

      const result = petSchema.safeParse(validPet);
      expect(result.success).toBe(true);
    });

    it('debe transformar weight de string a number', () => {
      const pet = {
        name: 'Firulais',
        species: 'Perro',
        weight: '15.5',
      };

      const result = petSchema.safeParse(pet);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBe(15.5);
      }
    });

    it('debe transformar weight vacío a undefined', () => {
      const pet = {
        name: 'Firulais',
        species: 'Perro',
        weight: '',
      };

      const result = petSchema.safeParse(pet);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBeUndefined();
      }
    });
  });

  describe('datos inválidos', () => {
    it('debe rechazar sin nombre', () => {
      const invalidPet = {
        name: '',
        species: 'Perro',
      };

      const result = petSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });

    it('debe rechazar sin especie', () => {
      const invalidPet = {
        name: 'Firulais',
        species: '',
      };

      const result = petSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });

    it('debe rechazar nombre muy largo', () => {
      const invalidPet = {
        name: 'A'.repeat(51),
        species: 'Perro',
      };

      const result = petSchema.safeParse(invalidPet);
      expect(result.success).toBe(false);
    });
  });

  describe('opciones predefinidas', () => {
    it('speciesOptions debe contener las especies principales', () => {
      const speciesValues = speciesOptions.map((s) => s.value);
      expect(speciesValues).toContain('Perro');
      expect(speciesValues).toContain('Gato');
      expect(speciesValues).toContain('Ave');
      expect(speciesValues).toContain('Otro');
    });

    it('genderOptions debe contener Macho y Hembra', () => {
      const genderValues = genderOptions.map((g) => g.value);
      expect(genderValues).toContain('Macho');
      expect(genderValues).toContain('Hembra');
    });
  });

  describe('valores por defecto', () => {
    it('debe tener todos los campos inicializados', () => {
      expect(defaultPetValues).toEqual({
        name: '',
        species: '',
        breed: '',
        gender: '',
        weight: '',
        microchip: '',
      });
    });
  });
});
