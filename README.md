# Early demo of Prisma client extensions

We are using the integration branch `4.7.0-integration-client-extensions.2`.

## Custom model
This demonstrates how a third party library can be used on a model to validate it.

### Validation via `joi`
```ts
// Validation library
const Joi = require("joi");
const joiSchema = Joi.object({
  // We set a range for the age integer and we validate email adress.
  age: Joi.number().integer().min(0).max(120).required(),
  email: Joi.string().email().required(),
});
```

### New `validate` method on `User`
```ts
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
```

### How it could be used during signup
```ts
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
```

Which should output:
```bash
Client Extensions Demo
not valid, hence no user created
not valid, hence no user created
Valid!
```

## What is next
`main.ts` also contains some code showing `query` and `result` extensions which only work on a type level yet. But especially `query` will be handy for this example as we can then properly override `create` or `update` queries to ensure they only write valid data to the database.

