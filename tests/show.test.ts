import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../prisma/clearDb";
import { Dog } from "@prisma/client";
import { seedDogs } from "../prisma/seedDogs";
import { AxiosInstance } from "./helper";

const { get } = AxiosInstance;
describe("GET /dogs/:id", () => {
  let doomslayer: Dog;
  let doogie: Dog;
  beforeEach(async () => {
    await clearDb();
    const {
      doomslayer: doomslayerFromSeeds,
      doogie: doogieFromSeeds,
    } = (await seedDogs()).dogs;
    doogie = doogieFromSeeds;
    doomslayer = doomslayerFromSeeds;
  });

  it("should return doomslayer by id", async () => {
    const { data } = await get(`/dogs/${doomslayer.id}`);
    expect(data).toEqual(doomslayer);
  });

  it("should return doogie by id", async () => {
    const { data } = await get(`/dogs/${doogie.id}`);
    expect(data).toEqual(doogie);
  });

  it("should have a status code of 200 for a dog that exists", async () => {
    const { status } = await get(`/dogs/${doomslayer.id}`);
    expect(status).toEqual(200);
  });

  it("If I have a bad request I should receive a message that says 'id should be a number'", async () => {
    const { data, status } = await get(`/dogs/dummy`);

    expect(status).toEqual(400);
    expect(data).toEqual({
      message: "id should be a number",
    });
  });

  it("If I request a dog that doesn't exist I should get a 204 and no data", async () => {
    const { status } = await get(`/dogs/999999999`).catch(
      (e) => e.response
    );
    expect(status).toEqual(204);
  });
});
