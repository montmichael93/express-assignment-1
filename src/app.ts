import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
import { Dog } from "@prisma/client";

const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.post("/dogs", async (req, res) => {
  const errors = [];
  const body: Dog = req?.body;
  const name = body?.name;
  const age = body?.age;
  const breed = body?.breed;
  const description = body?.description;
  const validKeys = ["name", "breed", "age", "description"];
  const invalidKey = Object.keys(body).filter(
    (key) => !validKeys.includes(key)
  );
  if (invalidKey.length > 0) {
    for (const key of invalidKey) {
      errors.push(`'${key}' is not a valid key`);
    }
  }
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }

  if (typeof name !== "string") {
    errors.push("name should be a string");
  }

  if (typeof breed !== "string") {
    errors.push("breed should be a string");
  }

  if (typeof description !== "string") {
    errors.push("description should be a string");
  }

  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }

  const newDog: Dog = await prisma.dog.create({
    data: {
      name,
      age,
      breed,
      description,
    },
  });
  res.status(201).send(newDog);
});

app.get("/dogs/", async (_req, res) => {
  const allDogs = await prisma.dog.findMany({
    orderBy: {
      id: "asc",
    },
  });
  res.status(200).send(allDogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const selectedDog = await prisma.dog.findUnique({
    where: {
      id,
    },
  });
  if (!selectedDog) {
    return res.status(204).send(selectedDog);
  }
  return res.send(selectedDog);
});

app.patch("/dogs/:id", async (req, res) => {
  type errorsArray = {
    errors: string[];
  };
  const errors: errorsArray = { errors: [] };
  const id = +req.params.id;
  const body: Dog = req.body;
  const name = req.body.name;
  const age = req.body.age;
  const breed = req.body.breed;
  const description = req.body.description;
  const validKeys = ["name", "breed", "age", "description"];
  const invalidObjectKeyFound = Object.keys(body).filter(
    (key) => !validKeys.includes(key)
  );
  if (invalidObjectKeyFound.length > 0) {
    for (const key of invalidObjectKeyFound) {
      errors.errors.push(`'${key}' is not a valid key`);
    }
  }
  const dogToUpdate = await prisma.dog.update({
    where: {
      id,
    },
    data: {
      name,
      age,
      breed,
      description,
    },
  });
  if (errors.errors.length > 0) {
    res.status(201).send(errors);
  }
  res.status(201).send(dogToUpdate);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  const toBeDeleted = await prisma.dog
    .delete({
      where: {
        id,
      },
    })
    .catch(() => null);
  if (toBeDeleted === null) {
    return res.status(204).send(toBeDeleted);
  }
  res.status(200).send(toBeDeleted);
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
