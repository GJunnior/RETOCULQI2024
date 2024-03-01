import app from "../app";
import request from "supertest";

describe("POST /tokens", () => {
  test("retonar codigo 400 si no se envia el request completo - campo expiration_month faltante", async () => {
    const res = await request(app)
      .post("/tokens")
      .send({ email: "g.alegriaq05@gmail.com", card_number: "4111111111111111", cvv: "123", expiration_year: 2029 })

    expect(res.statusCode).toEqual(400);
  })
})

describe("POST /tokens", () => {
  test("retonar codigo 400 si numero de tarjeta es invalido", async () => {
    const res = await request(app)
      .post("/tokens")
      .send({ email: "g.alegriaq05@gmail.com", card_number: "4111111111111112", cvv: "123", expiration_year: 2029, expiration_month: 12 })

    expect(res.statusCode).toEqual(400);
  })
})

describe("POST /tokens", () => {
  test("retonar codigo 200 si se envia datos correctos", async () => {
    const res = await request(app)
      .post("/tokens")
      .send({ email: "g.alegriaq05@gmail.com", card_number: "4111111111111111", cvv: "123", expiration_year: 2029, expiration_month: 12 })
      .set('Authorization', 'Bearer pk_test_LsRBKejzCOEEWOsw')

    expect(res.statusCode).toEqual(200);
  })
})


describe("POST /getCardData", () => {
  test("retonar codigo 400 si no se registra el bearen token para obtener los datos de la tarjeta", async () => {
    const res = await request(app)
      .post("/getCardData")

    expect(res.statusCode).toEqual(400);
  })
})

describe("POST /getCardData", () => {
  test("retonar codigo 400 si no el bearer token registrado ya expiro", async () => {
    const res = await request(app)
      .post("/getCardData")
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3JyZW8iOiJnLmFsZWdyaWFxMDVAZ21haWwuY29tIiwiaWF0IjoxNzA5Mjk1NjUyLCJleHAiOjE3MDkyOTU3MTJ9.OzeHP6k725g0MMxtm7bvtccusy-LEbYrE8vbdKySANU')

    expect(res.statusCode).toEqual(400);
  })
})

describe("POST /getCardData", () => {
  test("retonar codigo 200 si se envia bearer token correcto", async () => {
    const res = await request(app)
      .post("/getCardData")
      .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb3JyZW8iOiJnLmFsZWdyaWFxMDVAZ21haWwuY29tIiwiaWF0IjoxNzA5Mjk4Nzc4LCJleHAiOjE3MDkyOTg4Mzh9.EyJ8HAL2PBnRAJyQ9bhnWZRMhePDPUVZJQDvSjAXy-4')

    expect(res.statusCode).toEqual(200);
  })
})