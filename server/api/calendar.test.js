const request = require('supertest');
const router = require('./calendar');
const express = require('express');

const app = express();
app.use(router);

/**
 * Test timeslot GET
 */
describe('GET /api/calendar', () => {
  it('returns timeslots', async () => {
    const req = await request(app)
      .get('/api/calendar')
      .query({
        hostUserId: "Fouad"
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(req.body).toMatchObject({
      timeslots: expect.arrayContaining(["2023-06-04T09:00:00.000"]),
    });
  });
});

/**
 * Test error validation
 */
describe('GET /api/calendar', () => {
  it('returns error', async () => {
    const req = await request(app)
      .get('/api/calendar')
      .expect('Content-Type', /json/)
      .expect(400);

    expect(req.body).toMatchObject({
      errors: expect.arrayContaining(
        [{
          "type": "field",
          "msg": "Invalid value",
          "path": "hostUserId",
          "location": "query"
        }]
      )
    })
  });
});
