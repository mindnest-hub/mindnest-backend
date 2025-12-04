const { PrismaClient } = require('./src/generated/client/client');

try {
    const prisma = new PrismaClient();
    console.log('PrismaClient instantiated successfully');
    prisma.$disconnect();
} catch (error) {
    console.error('Error instantiating PrismaClient:', error);
}
