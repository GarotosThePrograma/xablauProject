import { z } from 'zod';

// definindo regras do zod fora do componente para mais performance
export const loginSchema = z.object({
email: z.email("Formato de e-mail inválido")
    .min(1, "O e-mail é obrigatório"),

password: z.string()
    .min(6, "A senha precisa ter 6-20 caracteres")
    .max(20, "A senha precisa ter 6-20 caracteres")
});

// usando um extend do loginSchema
export const registerSchema = loginSchema.extend({
name: z.string()
    .min(1, "O nome é obrigatório")
    .trim() /* tira os espaços extras no inicio e no fim */
    .min(2, 'O nome precisa ter 2-30 caracteres')
    .max(30, 'O nome precisa ter 2-30 caracteres'),
});