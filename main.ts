import { PrismaClient, Prisma, User } from "@prisma/client";

// Validation library
const Joi = require("joi");
const joiSchema = Joi.object({
  // We set a range for the age integer and we validate email adress.
  age: Joi.number().integer().min(0).max(120).required(),
  email: Joi.string().email().required(),
});

// Prisma client
const prisma = new PrismaClient();

// Extended Prisma Client which only adds `person` if the age and email are valid
const prismaWithCustomValidation = prisma.$extends({
  // Customizing models works at runtime
  model: {
    user: {
      // Create a custom method `validate` on user models. Returns true if data is valid.
      validate(data: unknown): data is User {
        const result = joiSchema.validate(data);
        return !result.error;
      },
    },
  },
});

async function main() {
  console.log("Client Extensions Demo");

  // Invalid user signup
  await signup({ age: 150, email: "foo@bar.com" });

  // Invalid user signup
  await signup({ age: 50, email: "foobar.com" });

  // Valid user signup
  await signup({ age: 50, email: "foo@bar.com" });
}

async function signup(data: unknown) {
  const userData = data;
  if (prismaWithCustomValidation.user.validate(userData)) {
    console.log("Valid!");
    const user = await prismaWithCustomValidation.user.create({
      data: userData,
    });
  } else {
    // not valid
    console.log("not valid, hence no user created");
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

const prismaWithCustomResultAndQuery = prisma.$extends({
  // Customizing results only works on a type level for you to try, doesn't work at runtime yet!
  result: {
    user: {
      needs: {
        fullName: { firstName: true, lastName: true },
      },
      fields: {
        fullName(user) {
          return `${user.firstName} ${user.lastName}`;
        },
      },
    },
  },
  // Customizing queries only works on a type level for you to try, doesn't work at runtime yet!
  query: {
    user: {
      async create({ args, data }) {
        const result = joiSchema.validate(data);
        if (result.error) {
          throw result.error;
        }
        return data;
      },
    },
  },
});


// This breaks at runtime and is hence commented out. But it shows the auto complete for the virtual field on `user`
// const frederik = await prismaWithCustomResultAndQuery.user.findUnique({
//   where: {
//     id: 1,
//   },
// });
// if (frederik) {
//   console.log(frederik.fullName);
// }
