import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { School } from '../src/modules/schools/school.model.js';
import { User } from '../src/modules/users/user.model.js';
import { Bus } from '../src/modules/transport/transport.model.js';
import { ROLES, DEFAULT_ROLE_PERMISSIONS } from '../src/constants/roles.js';

const app = createApp();

describe('Transport Module Integration Tests', () => {
  let school: any;
  let adminToken: string;

  beforeEach(async () => {
    // 1. Create School
    school = await School.create({
      name: 'Oakridge International School',
      code: 'OIS-001',
      slug: 'oakridge',
      email: 'admin@oakridge.edu',
      phone: '9988776655',
      address: 'Highway 9',
      city: 'Hyderabad',
      state: 'Telangana',
    });

    // 2. Create School Admin
    const hash = await bcrypt.hash('Password123!', 10);
    const admin = await User.create({
      schoolId: school._id,
      name: 'Transport Admin',
      email: 'transport@oakridge.edu',
      passwordHash: hash,
      role: ROLES.SCHOOL_ADMIN,
      permissions: DEFAULT_ROLE_PERMISSIONS.SCHOOL_ADMIN,
      status: 'ACTIVE',
    });

    // 3. Login to get token
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'transport@oakridge.edu',
      password: 'Password123!',
    });

    adminToken = loginRes.body.data.tokens.accessToken;
  });

  it('should register a new bus in the fleet', async () => {
    const res = await request(app)
      .post('/api/v1/transport/buses')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-school-id', school._id.toString())
      .send({
        busNumber: 'BUS-05',
        registrationNumber: 'TS-09-AB-1234',
        capacity: 40,
        model: 'Ashok Leyland Star',
        status: 'ACTIVE',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.busNumber).toBe('BUS-05');
    expect(res.body.data.capacity).toBe(40);
  });

  it('should prevent duplicate bus numbers within the same school', async () => {
    await Bus.create({
      schoolId: school._id,
      busNumber: 'BUS-05',
      registrationNumber: 'TS-09-AB-1234',
      capacity: 40,
    });

    const res = await request(app)
      .post('/api/v1/transport/buses')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-school-id', school._id.toString())
      .send({
        busNumber: 'BUS-05',
        registrationNumber: 'TS-09-CD-5678',
        capacity: 35,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should record live GPS updates for a bus', async () => {
    const bus = await Bus.create({
      schoolId: school._id,
      busNumber: 'BUS-10',
      registrationNumber: 'TS-09-XY-9999',
      capacity: 30,
    });

    const res = await request(app)
      .post(`/api/v1/transport/buses/${bus._id}/location`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-school-id', school._id.toString())
      .send({
        lat: 17.385,
        lng: 78.4867,
        speed: 42,
        heading: 90,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lat).toBe(17.385);
    expect(res.body.data.speed).toBe(42);
  });
});
