import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration from data/users.json to Prisma database...");

  const usersFile = path.join(process.cwd(), "data", "users.json");
  let jsonUsers = [];
  try {
    const raw = await readFile(usersFile, "utf8");
    jsonUsers = JSON.parse(raw);
    console.log(`Found ${jsonUsers.length} user(s) in data/users.json`);
  } catch (err) {
    console.log("No data/users.json found or failed to read:", err.message);
  }

  for (const u of jsonUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          passwordHash: u.passwordHash,
          emailVerified: true,
        },
      });
      console.log(`Migrated user: ${created.email} (${created.role})`);

      if (u.role === "Patient") {
        await prisma.patientProfile.upsert({
          where: { userId: created.id },
          create: { userId: created.id },
          update: {},
        });
      } else if (u.role === "Doctor") {
        await prisma.doctorProfile.upsert({
          where: { userId: created.id },
          create: {
            userId: created.id,
            specialization: "General Physician",
            bmdcNumber: `BMDC-A-${Math.floor(10000 + Math.random() * 90000)}`,
            verificationStatus: "PENDING",
            qualifications: "MBBS",
            experienceYears: 5,
            consultationFee: 500,
          },
          update: {},
        });
      }
    } else {
      console.log(`User ${u.email} already exists in database.`);
    }
  }

  // Create default Admin account if not existing
  const adminEmail = "admin@doctorforhome.com";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        name: "DoctorForHome Admin",
        email: adminEmail,
        role: "Admin",
        passwordHash: hashPassword("AdminPassword123!"),
        emailVerified: true,
      },
    });
    console.log(`Created default Admin account: ${admin.email} (Password: AdminPassword123!)`);
  } else {
    console.log(`Admin account ${adminEmail} already exists.`);
  }

  console.log("Migration and seeding complete!");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
