const { PrismaClient, Role, AppointmentType } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.weightHistory.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.client.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@vetclinic.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'VetClinic',
      role: Role.ADMIN,
    },
  });

  const vet1 = await prisma.user.create({
    data: {
      email: 'dr.smith@vetclinic.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Smith',
      role: Role.VETERINARIAN,
      specialty: 'Cirugía',
      licenseNumber: 'Cédula-001',
    },
  });

  const vet2 = await prisma.user.create({
    data: {
      email: 'dra.lopez@vetclinic.com',
      password: hashedPassword,
      firstName: 'María',
      lastName: 'López',
      role: Role.VETERINARIAN,
      specialty: 'Medicina General',
      licenseNumber: 'Cédula-002',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      email: 'reception@vetclinic.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'García',
      role: Role.RECEPTIONIST,
    },
  });

  console.log('✅ Users created');

  const room1 = await prisma.room.create({
    data: { name: 'Consultorio 1' },
  });

  const room2 = await prisma.room.create({
    data: { name: 'Consultorio 2' },
  });

  const room3 = await prisma.room.create({
    data: { name: 'Quirófano' },
  });

  console.log('✅ Rooms created');

  const medCategory = await prisma.category.create({
    data: { name: 'Medicamentos', type: 'medicine' },
  });

  const supplyCategory = await prisma.category.create({
    data: { name: 'Material de curación', type: 'supply' },
  });

  const foodCategory = await prisma.category.create({
    data: { name: 'Alimentos', type: 'food' },
  });

  console.log('✅ Categories created');

  await prisma.product.createMany({
    data: [
      {
        name: 'Amoxicilina 500mg',
        sku: 'AMOX-500-24',
        description: 'Antibiótico de amplio espectro',
        price: 150.0,
        cost: 95.0,
        stock: 50,
        minStock: 10,
        batch: 'LOTE-2024-A',
        expiryDate: new Date('2026-12-31'),
        categoryId: medCategory.id,
      },
      {
        name: 'Meloxicam 15mg',
        sku: 'MELOX-15-20',
        description: 'Antiinflamatorio no esteroideo',
        price: 120.0,
        cost: 75.0,
        stock: 35,
        minStock: 10,
        batch: 'LOTE-2024-B',
        expiryDate: new Date('2025-06-30'),
        categoryId: medCategory.id,
      },
      {
        name: 'Vacuna Rabia',
        sku: 'VAC-RAB-10',
        description: 'Vacuna antirrábica',
        price: 200.0,
        cost: 130.0,
        stock: 25,
        minStock: 5,
        batch: 'LOTE-2024-C',
        expiryDate: new Date('2025-03-15'),
        categoryId: medCategory.id,
      },
      {
        name: 'Gasa estéril',
        sku: 'GASA-EST-100',
        description: 'Gasa esterilizada 10x10cm',
        price: 45.0,
        cost: 25.0,
        stock: 100,
        minStock: 20,
        categoryId: supplyCategory.id,
      },
      {
        name: 'Alcohol 70%',
        sku: 'ALC-70-1L',
        description: 'Alcohol desnaturalizado 1L',
        price: 65.0,
        cost: 40.0,
        stock: 30,
        minStock: 10,
        categoryId: supplyCategory.id,
      },
      {
        name: 'Alimento Premium Perros',
        sku: 'ALIM-PERP-10K',
        description: 'Alimento premium para perros adultos 10kg',
        price: 450.0,
        cost: 320.0,
        stock: 15,
        minStock: 5,
        categoryId: foodCategory.id,
      },
    ],
  });

  console.log('✅ Products created');

  const client1 = await prisma.client.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@email.com',
      phone: '5551234567',
      address: 'Calle Principal #123, Col. Centro, CDMX',
      rfc: 'XAXX010101XXX',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      firstName: 'Sofia',
      lastName: 'Rodríguez',
      email: 'sofia.rodriguez@email.com',
      phone: '5559876543',
      address: 'Av. Insurgentes #456, Col. Roma, CDMX',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      firstName: 'Miguel',
      lastName: 'Hernández',
      phone: '5555551234',
      address: 'Calle 5 #12, Col. Del Valle, CDMX',
    },
  });

  console.log('✅ Clients created');

  const pet1 = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Perro',
      breed: 'Labrador Retriever',
      dateOfBirth: new Date('2020-05-15'),
      gender: 'Macho',
      color: 'Dorado',
      weight: 28.5,
      microchip: '123456789012345',
      clientId: client1.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Gato',
      breed: 'Persa',
      dateOfBirth: new Date('2022-03-20'),
      gender: 'Hembra',
      color: 'Blanco',
      weight: 4.2,
      clientId: client1.id,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Rocky',
      species: 'Perro',
      breed: 'Bulldog Francés',
      dateOfBirth: new Date('2021-08-10'),
      gender: 'Macho',
      color: 'Atigrado',
      weight: 12.3,
      clientId: client2.id,
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      name: 'Mimi',
      species: 'Gato',
      breed: 'Siamés',
      dateOfBirth: new Date('2019-11-25'),
      gender: 'Hembra',
      color: 'Crema con puntas café',
      weight: 3.8,
      clientId: client3.id,
    },
  });

  console.log('✅ Pets created');

  await prisma.weightHistory.createMany({
    data: [
      { petId: pet1.id, weight: 25.0, recordedAt: new Date('2023-01-15') },
      { petId: pet1.id, weight: 26.5, recordedAt: new Date('2023-06-15') },
      { petId: pet1.id, weight: 27.8, recordedAt: new Date('2023-12-15') },
      { petId: pet1.id, weight: 28.5, recordedAt: new Date('2024-06-15') },
      { petId: pet2.id, weight: 4.0, recordedAt: new Date('2023-03-01') },
      { petId: pet2.id, weight: 4.2, recordedAt: new Date('2024-01-01') },
    ],
  });

  await prisma.vaccination.createMany({
    data: [
      {
        petId: pet1.id,
        vaccineName: 'Rabia',
        batch: 'RAB-2024-001',
        applicationDate: new Date('2024-01-15'),
        nextDueDate: new Date('2025-01-15'),
        veterinarian: 'Dr. Carlos Smith',
      },
      {
        petId: pet1.id,
        vaccineName: 'Séxtuple',
        batch: 'SEX-2024-003',
        applicationDate: new Date('2024-03-20'),
        nextDueDate: new Date('2025-03-20'),
        veterinarian: 'Dra. María López',
      },
      {
        petId: pet2.id,
        vaccineName: 'Triple felina',
        batch: 'TRF-2024-002',
        applicationDate: new Date('2024-02-10'),
        nextDueDate: new Date('2025-02-10'),
        veterinarian: 'Dr. Carlos Smith',
      },
      {
        petId: pet3.id,
        vaccineName: 'Rabia',
        batch: 'RAB-2024-004',
        applicationDate: new Date('2024-04-05'),
        nextDueDate: new Date('2025-04-05'),
        veterinarian: 'Dra. María López',
      },
    ],
  });

  console.log('✅ Weight history and vaccinations created');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const appointment1 = await prisma.appointment.create({
    data: {
      dateTime: tomorrow,
      duration: 30,
      type: AppointmentType.CONSULTATION,
      notes: 'Control anual',
      colorCode: '#3b82f6',
      petId: pet1.id,
      doctorId: vet1.id,
      roomId: room1.id,
    },
  });

  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);
  dayAfter.setHours(10, 30, 0, 0);

  await prisma.appointment.create({
    data: {
      dateTime: dayAfter,
      duration: 45,
      type: AppointmentType.SURGERY,
      notes: 'Cirugía de esterilización',
      colorCode: '#8b5cf6',
      petId: pet3.id,
      doctorId: vet1.id,
      roomId: room3.id,
    },
  });

  const nextWeek = new Date(tomorrow);
  nextWeek.setDate(nextWeek.getDate() + 3);
  nextWeek.setHours(11, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      dateTime: nextWeek,
      duration: 30,
      type: AppointmentType.VACCINATION,
      notes: 'Refuerzo de vacunas',
      colorCode: '#22c55e',
      petId: pet4.id,
      doctorId: vet2.id,
      roomId: room2.id,
    },
  });

  console.log('✅ Appointments created');

  await prisma.medicalRecord.create({
    data: {
      petId: pet1.id,
      veterinarianId: vet1.id,
      appointmentId: appointment1.id,
      subjective: 'Dueño reporta que Max ha estado más letárgico de lo normal. Ha comido menos en los últimos 3 días.',
      objective: 'Temperatura 38.9°C, mucosas ligeramente pálidas, ganglios submandibulares ligeramente aumentados. Abdomen distendido.',
      assessment: 'Posible gastritis o inicio de enfermedad inflamatoria intestinal. Requiere estudios complementarios.',
      plan: '1. Hemograma completo\n2. Perfil bioquímico\n3. Radiografía abdominal\n4. Dieta blanda por 7 días\n5. Control en 1 semana',
      diagnosis: 'Gastritis - Probable',
      treatment: 'Omeprazol 1mg/kg cada 24hrs por 7 días\nSucralfato 0.5g cada 12hrs por 5 días',
    },
  });

  console.log('✅ Medical records created');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📧 Login credentials:');
  console.log('   Admin: admin@vetclinic.com / password123');
  console.log('   Dr. Smith: dr.smith@vetclinic.com / password123');
  console.log('   Dra. López: dra.lopez@vetclinic.com / password123');
  console.log('   Recepcionista: reception@vetclinic.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
