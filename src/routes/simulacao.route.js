import express from 'express';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import simulacaoController from '../controller/simulacao.controller.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /log-Simulation:
 *   post:
 *     summary: Registra uma nova simulação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipo:
 *                 type: string
 *                 example: acao
 *                 description: Tipo de investimento
 *               nome:
 *                 type: string
 *                 example: APPL
 *                 description: Nome do ativo
 *               valor:
 *                 type: number
 *                 example: 35.50
 *                 description: Valor do ativo
 *               invest_inicial:
 *                 type: number
 *                 example: 10000
 *                 description: Valor inicial investido
 *               invest_mensal:
 *                 type: number
 *                 example: 1000
 *                 description: Valor investido mensalmente
 *               meses:
 *                 type: integer
 *                 example: 60
 *                 description: Quantidade de meses da simulação
 *               inflacao:
 *                 type: number
 *                 example: 0.045
 *                 description: Taxa de inflação anual
 *     responses:
 *       201:
 *         description: Simulação registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 */
router.post('/log-Simulation', verifyToken, simulacaoController.logSimulation);

/**
 * @swagger
 * /get-Simulations:
 *   get:
 *     summary: Obtém todas as simulações do usuário
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de simulações obtida com sucesso
 *       401:
 *         description: Não autorizado
 */
router.get('/get-Simulations', verifyToken, simulacaoController.getSimulations);

/**
 * @swagger
 * /delete-Simulation:
 *   delete:
 *     summary: Deleta uma simulação
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               simulationId:
 *                 type: integer
 *                 example: 1
 *                 description: ID da simulação a ser deletada
 *     responses:
 *       200:
 *         description: Simulação deletada com sucesso
 *       400:
 *         description: ID inválido ou simulação não encontrada
 *       401:
 *         description: Não autorizado
 */
router.delete('/delete-Simulation', verifyToken, simulacaoController.deleteSimulations);
router.patch('/patch-simulation', verifyToken, simulacaoController.patchSimulation);

export default router;