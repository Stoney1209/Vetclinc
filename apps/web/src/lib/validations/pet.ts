import { z } from 'zod';

export const petSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre es muy largo'),
  species: z
    .string()
    .min(1, 'La especie es requerida'),
  breed: z
    .string()
    .max(50, 'La raza es muy larga')
    .optional()
    .or(z.literal('')),
  gender: z
    .string()
    .optional()
    .or(z.literal('')),
  weight: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val ? parseFloat(val) : undefined)),
  microchip: z
    .string()
    .max(20, 'El microchip es muy largo')
    .optional()
    .or(z.literal('')),
});

export type PetFormValues = z.infer<typeof petSchema>;

export const defaultPetValues = {
  name: '',
  species: '',
  breed: '',
  gender: '',
  weight: '',
  microchip: '',
};

export const speciesOptions = [
  { value: 'Perro', label: 'Perro' },
  { value: 'Gato', label: 'Gato' },
  { value: 'Ave', label: 'Ave' },
  { value: 'Conejo', label: 'Conejo' },
  { value: 'Hámster', label: 'Hámster' },
  { value: 'Reptil', label: 'Reptil' },
  { value: 'Otro', label: 'Otro' },
];

export const genderOptions = [
  { value: 'Macho', label: 'Macho' },
  { value: 'Hembra', label: 'Hembra' },
];
