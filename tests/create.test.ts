import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../prisma/clearDb";
import { Dog } from "@prisma/client";
import { seedDogs } from "../prisma/seedDogs";
import { AxiosInstance } from "./helper";
import { prisma } from "../prisma/prisma-instance";

const { post } = AxiosInstance;

describe("POST /dogs", () => {
  let allSeededDogs: Dog[];

  beforeEach(async () => {
    await clearDb();
    allSeededDogs = (await seedDogs()).dogsArray;
  });

  it("Endpoint should exist", async () => {
    const { status } = await post(`/dogs`);
    expect(status).not.toBe(404);
  });

  it("Should create a dog if I send the correct data", async () => {
    const createData = {
      name: "BroomSlayer",
      description:
        "Doom Slayer slays demons, Broom Slayer slays brooms",
      breed: "Blood Hound",
      age: 2,
    };
    await post(`/dogs`, createData);
    const newAllDogs = await prisma.dog.findMany();
    expect(newAllDogs.length).toBe(
      allSeededDogs.length + 1
    );
  });
  it("Should return a 201 if a dog is created", async () => {
    const createData = {
      name: "BroomSlayer",
      description:
        "Doom Slayer slays demons, Broom Slayer slays brooms",
      breed: "Blood Hound",
      age: 2,
    };
    const { status } = await post(`/dogs`, createData);
    expect(status).toBe(201);
  });

  it("Should have an errors array saying `age should be a number` if I have a bad input for age", async () => {
    const createData = {
      name: "BroomSlayer",
      description:
        "Doom Slayer slays demons, Broom Slayer slays brooms",
      breed: "Blood Hound",
      age: null,
    };
    const { status, data } = await post(
      `/dogs`,
      createData
    );
    const errors = data.errors;
    const correctErrorIncluded = errors.some(
      (err: string) => err === "age should be a number"
    );

    expect(correctErrorIncluded).toBe(true);
    expect(status).toBe(400);
  });

  it("Should have error 'name should be a string' if  improper name is passed", async () => {
    const createData = {
      description:
        "Doom Slayer slays demons, Broom Slayer slays brooms",
      breed: "Blood Hound",
      age: 2,
    };
    const { status, data } = await post(
      `/dogs`,
      createData
    );
    const errors = data.errors;
    const correctErrorIncluded = errors.some(
      (err: string) => err === "name should be a string"
    );

    expect(correctErrorIncluded).toBe(true);
    expect(status).toBe(400);
  });

  it("Should have error 'description should be a string' if  improper description is passed", async () => {
    const createData = {
      name: "BroomSlayer",
      breed: "Blood Hound",
      age: 2,
    };
    const { status, data } = await post(
      `/dogs`,
      createData
    );

    const errors = data.errors;
    const correctErrorIncluded = errors.some(
      (err: string) =>
        err === "description should be a string"
    );

    expect(correctErrorIncluded).toBe(true);
    expect(status).toBe(400);
  });

  it("Should be able to render multiple errors about the data", async () => {
    const createData = {
      breed: "Blood Hound",
    };
    const { status, data } = await post(
      `/dogs`,
      createData
    );

    const errors = data.errors;
    const correctNameErrorIncluded = errors.some(
      (err: string) => err === "name should be a string"
    );
    const correctAgeErrorIncluded = errors.some(
      (err: string) => err === "age should be a number"
    );
    const correctDescriptionErrorIncluded = errors.some(
      (err: string) =>
        err === "description should be a string"
    );

    expect(correctNameErrorIncluded).toBe(true);
    expect(correctAgeErrorIncluded).toBe(true);
    expect(correctDescriptionErrorIncluded).toBe(true);
    expect(status).toBe(400);
  });

  it("Should reject invalid keys", async () => {
    const createData = {
      cheese: "yes please",
      id: "123",
    };
    const { data } = await post(`/dogs`, createData);

    for (const key of ["id", "cheese"]) {
      expect(data.errors).toContain(
        `'${key}' is not a valid key`
      );
    }
  });
});
