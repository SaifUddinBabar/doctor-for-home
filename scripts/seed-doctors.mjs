import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding doctors from doctors.json...");
  const doctorsPath = path.join(__dirname, "..", "src", "data", "doctors.json");
  const rawData = fs.readFileSync(doctorsPath, "utf-8");
  const doctors = JSON.parse(rawData);

  const defaultPasswordHash = hashPassword("DoctorPassword123!");

  const defaultDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const defaultSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  for (const doc of doctors) {
    const slug = doc.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const email = `${slug}@doctorforhome.com`;
    const bmdcNumber = `BMDC-A-${70000 + doc.id * 173}`;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { doctorProfile: true },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          name: doc.name,
          email,
          passwordHash: defaultPasswordHash,
          role: "Doctor",
          emailVerified: true,
          phone: `+8801700${String(doc.id).padStart(5, "0")}`,
          avatar: doc.avatar,
          doctorProfile: {
            create: {
              specialization: doc.specialty,
              qualifications: `MBBS, FCPS (${doc.specialty})`,
              bmdcNumber,
              experienceYears: doc.experience,
              consultationFee: doc.fee * 10, // In BDT
              homeVisitFee: (doc.fee * 10) + 300,
              bio: doc.bio,
              hospitalAffiliation: `Square Hospital, ${doc.location}`,
              location: doc.location,
              avatar: doc.avatar,
              verificationStatus: "APPROVED",
              verificationNotes: "Pre-verified BMDC Registered Medical Practitioner.",
              availableDays: JSON.stringify(defaultDays),
              availableTimeSlots: JSON.stringify(defaultSlots),
              slotDurationMinutes: 30,
              blockedDates: JSON.stringify([]),
            },
          },
        },
      });
      console.log(`Created doctor: ${doc.name} (${email}) - ${bmdcNumber}`);
    } else if (existingUser.doctorProfile) {
      await prisma.doctorProfile.update({
        where: { id: existingUser.doctorProfile.id },
        data: {
          availableDays: existingUser.doctorProfile.availableDays || JSON.stringify(defaultDays),
          availableTimeSlots: existingUser.doctorProfile.availableTimeSlots || JSON.stringify(defaultSlots),
          slotDurationMinutes: existingUser.doctorProfile.slotDurationMinutes || 30,
          blockedDates: existingUser.doctorProfile.blockedDates || JSON.stringify([]),
          location: existingUser.doctorProfile.location || doc.location,
          avatar: existingUser.doctorProfile.avatar || doc.avatar,
          hospitalAffiliation: existingUser.doctorProfile.hospitalAffiliation || `Square Hospital, ${doc.location}`,
        },
      });
      console.log(`Updated doctor availability: ${doc.name}`);
    }
  }

  // Update existing doctor mdbabar2022@gmail.com
  const babarDoctor = await prisma.user.findUnique({
    where: { email: "mdbabar2022@gmail.com" },
    include: { doctorProfile: true },
  });

  if (babarDoctor?.doctorProfile) {
    await prisma.doctorProfile.update({
      where: { id: babarDoctor.doctorProfile.id },
      data: {
        availableDays: JSON.stringify(defaultDays),
        availableTimeSlots: JSON.stringify(["10:00", "11:00", "12:00", "15:00", "16:00", "17:00"]),
        slotDurationMinutes: 30,
        blockedDates: JSON.stringify([]),
        location: "Dhaka",
        hospitalAffiliation: "Dhaka Medical College Hospital",
        bio: "Experienced general physician providing comprehensive home and online consultations.",
      },
    });
    console.log("Updated mdbabar2022@gmail.com doctor profile availability.");
  }

  const count = await prisma.doctorProfile.count({ where: { verificationStatus: "APPROVED" } });
  console.log(`Total APPROVED doctors in DB: ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
