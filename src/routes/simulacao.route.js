import express from 'express';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import simulacaoController from '../controller/simulacao.controller.js';

const router = express.Router();

router.post('/log-Simulation', verifyToken, simulacaoController.logSimulation);
router.get('/get-Simulations', verifyToken, simulacaoController.getSimulations);
router.delete('/delete-Simulation', verifyToken, simulacaoController.deleteSimulations);

export default router;