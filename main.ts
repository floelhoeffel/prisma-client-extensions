import { PrismaClient, Prisma, User } from "@prisma/client";

const Joi = require("joi");
const joiSchema = Joi.object({
  age: Joi.number().integer().min(0).max(120).required(),
  email: Joi.string().required()
});

const prisma = new PrismaClient();


const xprisma = prisma.$extends({
  model: {
    user: {
      validate(data: unknown): data is User  {

        const result = joiSchema.validate(data);
        return !result.error
      },
    },
  },
});

async function main() {
  console.log("Client Extensions");

  await signup({age: 150, email:"hello@world.com"})



}

async function signup(data:unknown) {

 

    const userData = data
    if (xprisma.user.validate(userData)) {
      console.log("Valid!");
      await xprisma.user.create({ data: userData })
    } else {
      // not valid
      //xprisma.user.create({ data: userData })
      console.log('not valid, hence no user created')
    }
 

}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
