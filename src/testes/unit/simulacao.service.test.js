import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import simulacaoService from '../../services/simulacao.service.js';

jest.mock('@models/index.js', () => ({
  __esModule: true,
  default: {
      simulacao: {
        create: jest.fn(),
        findAll: jest.fn(),
        destroy: jest.fn(),
      },
  }
}));

import db from '@models/index.js';

describe('Simulacao Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSimulation', () => {
    it('should create a new simulation successfully', async () => {
      console.log("Is db.simulacao.create a mock?", jest.isMockFunction(db.simulacao.create));

      const simulationData = { userId: 1, tipo: 'acao', nome: 'APPL', invest_inicial: 1000, invest_mensal: 100, meses: 12, inflacao: 0.05, valor: 150 };
      const createdSimulation = { id: 1, ...simulationData };

      if (!db || !db.simulacao || !db.simulacao.create) {
         throw new Error("Mocking failed: db.simulacao.create is not defined!");
      }

      db.simulacao.create.mockResolvedValue(createdSimulation);

      const result = await simulacaoService.createSimulation(simulationData);

      expect(db.simulacao.create).toHaveBeenCalledWith(simulationData);
      expect(result).toEqual(createdSimulation);
    });

    it('should throw an error if creation fails', async () => {
       console.log("Is db.simulacao.create a mock?", jest.isMockFunction(db.simulacao.create));
       if (!db || !db.simulacao || !db.simulacao.create) {
         throw new Error("Mocking failed: db.simulacao.create is not defined!");
      }

      const error = new Error('Database error');
      db.simulacao.create.mockRejectedValue(error);

      await expect(simulacaoService.createSimulation({})).rejects.toThrow('Error creating simulation: Database error');
    });
  });

  describe('getSimulationsByUser', () => {
    it('should return simulations for a user', async () => {
       if (!db || !db.simulacao || !db.simulacao.findAll) {
         throw new Error("Mocking failed: db.simulacao.findAll is not defined!");
      }
      const userId = 1;
      const simulations = [{ id: 1, userId: 1 }, { id: 2, userId: 1 }];
      db.simulacao.findAll.mockResolvedValue(simulations);

      const result = await simulacaoService.getSimulationsByUser(userId);

      expect(db.simulacao.findAll).toHaveBeenCalledWith({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      expect(result).toEqual(simulations);
    });

     it('should throw an error if fetching fails', async () => {
        if (!db || !db.simulacao || !db.simulacao.findAll) {
         throw new Error("Mocking failed: db.simulacao.findAll is not defined!");
      }
        const error = new Error('Fetch error');
        db.simulacao.findAll.mockRejectedValue(error);

        await expect(simulacaoService.getSimulationsByUser(1)).rejects.toThrow('Error fetching simulations: Fetch error');
    });
  });

   describe('deleteSimulation', () => {
      it('should delete a simulation and return the count', async () => {
         if (!db || !db.simulacao || !db.simulacao.destroy) {
         throw new Error("Mocking failed: db.simulacao.destroy is not defined!");
      }
        const userId = 1;
        const simulationId = 10;
        db.simulacao.destroy.mockResolvedValue(1);

        const result = await simulacaoService.deleteSimulation(userId, simulationId);

        expect(db.simulacao.destroy).toHaveBeenCalledWith({
            where: { id: simulationId, userId: userId },
        });
        expect(result).toBe(1);
    });

     it('should throw an error if deletion fails', async () => {
        if (!db || !db.simulacao || !db.simulacao.destroy) {
         throw new Error("Mocking failed: db.simulacao.destroy is not defined!");
      }
        const error = new Error('Deletion error');
        db.simulacao.destroy.mockRejectedValue(error);

        await expect(simulacaoService.deleteSimulation(1, 10)).rejects.toThrow('Error deleting simulation: Deletion error');
    });
   });
});