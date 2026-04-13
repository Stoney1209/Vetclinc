import { z } from 'zod';

export const clientSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre es muy largo'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido es muy largo'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono es muy largo')
    .regex(/^\d+$/, 'El teléfono solo debe contener números'),
  address: z
    .string()
    .max(200, 'La dirección es muy larga')
    .optional()
    .or(z.literal('')),
  rfc: z
    .string()
    .max(13, 'El RFC es muy largo')
    .optional()
    .or(z.literal('')),
});

export type ClientFormValues = z.infer<typeof clientSchema>;

export const defaultClientValues: ClientFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  rfc: '',
};
