import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get access token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'demo@Thenga.co.za',
        password: 'password123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/products (GET)', () => {
    it('should get all products', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?merchantId=1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/products?merchantId=1')
        .expect(401);
    });
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          merchantId: '1',
          sku: 'TEST-001',
          name: 'Test Product',
          description: 'Test Description',
          price: 1000,
          stock: 10,
          imageUrl: ['https://example.com/image.jpg'],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test Product');
        });
    });
  });

  describe('/products/:id (PUT)', () => {
    it('should update a product', () => {
      return request(app.getHttpServer())
        .put('/api/v1/products/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Product',
          price: 1500,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', '1');
          expect(res.body).toHaveProperty('name', 'Updated Product');
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', () => {
      return request(app.getHttpServer())
        .delete('/api/v1/products/1')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Product deleted successfully');
        });
    });
  });
});
