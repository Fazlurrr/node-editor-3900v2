import { z } from 'zod';

export const updatePasswordAdmin = z
  .object({
    password: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
    repeatPassword: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        path: ['repeatPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      });
    }
  });

export const updatePasswordUser = z
  .object({
    currentPassword: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
    password: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
    repeatPassword: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        path: ['repeatPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      });
    }
  });

export const registerUserSchema = z
  .object({
    username: z
      .string()
      .min(2, 'Username must contain at least 2 character(s)')
      .max(50, "Username can't be longer than 50 characters"),
    password: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
    repeatPassword: z
      .string()
      .min(5, 'Password must contain at least 5 character(s)')
      .max(50, "Password can't be longer than 50 characters"),
    role: z.enum(['user', 'admin']),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.repeatPassword) {
      ctx.addIssue({
        path: ['repeatPassword'],
        message: 'Passwords do not match',
        code: 'custom',
      });
    }
  });
