import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app, db } from '../../index.js';
import jwt from 'jsonwebtoken';
import { createUser } from '../../services/user.service.js';

let testUser;
let token;
let simulationToGetId;
let simulationToDeleteId;

const JWT_SECRET = process.env.JWT_SECRET || 'your_test_secret_key_123!';

describe('Simulacao Routes', () => {

    beforeAll(async () => {
        try {
            await db.sequelize.sync({ force: true });

            testUser = await createUser({
                username: 'sim_user',
                email: 'sim@example.com',
                password: 'password123',
            });

            if (!testUser || !testUser.id) {
                throw new Error("Test user creation failed.");
            }

            token = jwt.sign({ id: testUser.id }, JWT_SECRET, { expiresIn: '1h' });

            const simToGet = await db.simulacao.create({
                userId: testUser.id,
                tipo: 'renda-fixa',
                nome: 'Get Me Renda Fixa',
                invest_inicial: 2000,
                invest_mensal: 200,
                meses: 24,
                inflacao: 0.06,
            });
            simulationToGetId = simToGet.id;

            const simToDelete = await db.simulacao.create({
                userId: testUser.id,
                tipo: 'acao',
                nome: 'Delete Me Stock',
                valor: 150.75,
                invest_inicial: 500,
                invest_mensal: 50,
                meses: 5,
                inflacao: 0.01,
            });
            simulationToDeleteId = simToDelete.id;

        } catch (error) {
            console.error("Critical error during beforeAll setup:", error);
            throw error;
        }
    });

    afterAll(async () => {
        await db.sequelize.close();
    });

    describe('POST /simulacao', () => {
        it('should create a new simulation', async () => {
            const response = await request(app)
                .post('/log-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'renda-fixa',
                    nome: 'My First Renda Fixa',
                    invest_inicial: 1000,
                    invest_mensal: 100,
                    meses: 12,
                    inflacao: 0.05,
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();
            expect(response.body.nome).toBe('My First Renda Fixa');
            expect(response.body.userId).toBe(testUser.id);
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/log-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'fundo',
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Missing required fields');
        });

        it('should return 400 if tipo is acao and valor is missing', async () => {
            const response = await request(app)
                .post('/log-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    tipo: 'acao',
                    nome: 'My Stock',
                    invest_inicial: 500,
                    invest_mensal: 50,
                    meses: 6,
                    inflacao: 0.03,
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Value is required for stock simulations');
        });

        it('should return 401 or 403 if no token is provided', async () => {
            const response = await request(app)
                .post('/log-Simulation')
                .send({
                    tipo: 'renda-fixa',
                    nome: 'No Token Renda Fixa',
                    invest_inicial: 1000,
                    invest_mensal: 100,
                    meses: 12,
                    inflacao: 0.05,
                });
            expect([401, 403]).toContain(response.status);
        });
    });

    describe('GET /simulacao', () => {

        it('should get all simulations for the user', async () => {
            const response = await request(app)
                .get('/get-Simulations')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some(sim => sim.id === simulationToGetId)).toBe(true);
        });
    });

    describe('DELETE /simulacao', () => {

        it('should delete a simulation', async () => {
            const response = await request(app)
                .delete('/delete-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({ simulationId: simulationToDeleteId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Simulation deleted successfully');

            const deletedSim = await db.simulacao.findByPk(simulationToDeleteId);
            expect(deletedSim).toBeNull();
        });

        it('should return 404 if simulation not found', async () => {
            const response = await request(app)
                .delete('/delete-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({ simulationId: 99999 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Simulation not found or not owned by user');
        });

        it('should return 400 if simulationId is missing', async () => {
            const response = await request(app)
                .delete('/delete-Simulation')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Simulation ID is required');
        });
    });
});