const { PrismaClient } = require('@prisma/client');

async function test() {
    const prisma = new PrismaClient();
    try {
        console.log('Attempting to connect to database...');
        await prisma.$connect();
        console.log('✅ Connection successful!');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}
test();
