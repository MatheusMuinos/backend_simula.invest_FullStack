import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { getMockReq, getMockRes } from '@jest-mock/express';
import simulacaoController from '../../controller/simulacao.controller.js';
import simulacaoService from '@services/simulacao.service.js';

jest.mock('@services/simulacao.service.js', () => ({
  createSimulation: jest.fn(),
  getSimulationsByUser: jest.fn(),
  deleteSimulation: jest.fn(),
}));

describe('Simulacao Controller', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = getMockReq();
    ({ res, next } = getMockRes());
    jest.clearAllMocks();
  });

  describe('logSimulation', () => {
    const mockSimulationData = {
      tipo: 'renda-fixa',
      nome: 'Tesouro Selic',
      invest_inicial: 1000,
      invest_mensal: 100,
      meses: 12,
      inflacao: 0.05,
    };

    it('should create a simulation and return 201 for non-acao type', async () => {
      req.body = { ...mockSimulationData };
      req.userId = 'user123';
      const createdSim = { id: 'sim1', userId: req.userId, ...req.body };
      simulacaoService.createSimulation.mockResolvedValue(createdSim);

      await simulacaoController.logSimulation(req, res);

      expect(simulacaoService.createSimulation).toHaveBeenCalledWith({
        userId: req.userId,
        ...req.body,
        valor: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdSim);
    });

    it('should create a simulation including "valor" and return 201 for acao type', async () => {
        req.body = { ...mockSimulationData, tipo: 'acao', valor: 150.75 };
        req.userId = 'user123';
        const createdSim = { id: 'sim2', userId: req.userId, ...req.body };
        simulacaoService.createSimulation.mockResolvedValue(createdSim);

        await simulacaoController.logSimulation(req, res);

        expect(simulacaoService.createSimulation).toHaveBeenCalledWith({
            userId: req.userId,
            ...req.body,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(createdSim);
    });

    it('should return 400 if required fields are missing', async () => {
      req.body = { nome: 'Tesouro Selic' };

      await simulacaoController.logSimulation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing required fields" });
      expect(simulacaoService.createSimulation).not.toHaveBeenCalled();
    });

    it('should return 400 if tipo is "acao" and valor is missing', async () => {
      req.body = { ...mockSimulationData, tipo: 'acao' };
      req.userId = 'user123';

      await simulacaoController.logSimulation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Value is required for stock simulations" });
      expect(simulacaoService.createSimulation).not.toHaveBeenCalled();
    });

    it('should return 500 if simulacaoService.createSimulation throws an error', async () => {
      req.body = { ...mockSimulationData };
      req.userId = 'user123';
      const errorMessage = 'Database error during creation';
      simulacaoService.createSimulation.mockRejectedValue(new Error(errorMessage));

      await simulacaoController.logSimulation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('getSimulations', () => {
    it('should get simulations by user and return 200', async () => {
      req.userId = 'user123';
      const mockSimulations = [
        { id: 'sim1', nome: 'Sim A' },
        { id: 'sim2', nome: 'Sim B' },
      ];
      simulacaoService.getSimulationsByUser.mockResolvedValue(mockSimulations);

      await simulacaoController.getSimulations(req, res);

      expect(simulacaoService.getSimulationsByUser).toHaveBeenCalledWith(req.userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSimulations);
    });

    it('should return 500 if simulacaoService.getSimulationsByUser throws an error', async () => {
      req.userId = 'user123';
      const errorMessage = 'Database error fetching simulations';
      simulacaoService.getSimulationsByUser.mockRejectedValue(new Error(errorMessage));

      await simulacaoController.getSimulations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('deleteSimulations', () => {
    it('should delete a simulation and return 200', async () => {
      req.userId = 'user123';
      req.body = { simulationId: 'simToDelete123' };
      simulacaoService.deleteSimulation.mockResolvedValue(1);

      await simulacaoController.deleteSimulations(req, res);

      expect(simulacaoService.deleteSimulation).toHaveBeenCalledWith(req.userId, 'simToDelete123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Simulation deleted successfully" });
    });

    it('should return 400 if simulationId is missing', async () => {
      req.body = {}; // Missing simulationId

      await simulacaoController.deleteSimulations(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Simulation ID is required" });
      expect(simulacaoService.deleteSimulation).not.toHaveBeenCalled();
    });

    it('should return 404 if simulation not found or not owned by user (deletedCount is 0)', async () => {
      req.userId = 'user123';
      req.body = { simulationId: 'simNotFound456' };
      simulacaoService.deleteSimulation.mockResolvedValue(0);

      await simulacaoController.deleteSimulations(req, res);

      expect(simulacaoService.deleteSimulation).toHaveBeenCalledWith(req.userId, 'simNotFound456');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Simulation not found or not owned by user" });
    });

    it('should return 500 if simulacaoService.deleteSimulation throws an error', async () => {
      req.userId = 'user123';
      req.body = { simulationId: 'simError789' };
      const errorMessage = 'Database error during deletion';
      simulacaoService.deleteSimulation.mockRejectedValue(new Error(errorMessage));

      await simulacaoController.deleteSimulations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });
});