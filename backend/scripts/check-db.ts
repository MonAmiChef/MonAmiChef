import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, username: true }
    });
    console.log('User list:');
    console.log(JSON.stringify(users, null, 2));

    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'pushToken'
    `;
    console.log('PushToken column info:');
    console.log(JSON.stringify(tableInfo, null, 2));
  } catch (e) {
    console.error('Error fetching database data:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
