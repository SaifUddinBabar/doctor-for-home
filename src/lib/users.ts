import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/lib/auth";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
}

export async function getUsers(): Promise<StoredUser[]> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });
    return users as StoredUser[];
  } catch (error) {
    console.error("Error fetching users from Prisma:", error);
    return [];
  }
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: {
      patientProfile: true,
      doctorProfile: true,
    },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      patientProfile: true,
      doctorProfile: true,
    },
  });
}
