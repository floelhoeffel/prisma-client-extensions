import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Gude')


  const xprisma = prisma.$extends({
    model: {
      user: {
        async signUp(email: string) {
          await prisma.user.create({
            data: {
                email: email
            }
          })
        },
      },
    }
  })



}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })