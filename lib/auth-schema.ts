import { z } from 'zod';

export const emailSchema = z.string().email({ message: "Adresse email invalide" }).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
  message: "Format d'email non valide",
});
