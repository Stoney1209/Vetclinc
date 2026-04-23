import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const res = await prisma.$queryRaw`SELECT 1`;
    console.log('Connection OK', res);
    const tableInfo = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'isActive'`;
    console.log('Table info:', tableInfo);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
