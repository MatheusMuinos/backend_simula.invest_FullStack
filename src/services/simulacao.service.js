import db from '../models/index.js';

const createSimulation = async (simulationData) => {
    try {
        const newSimulation = await db.simulacao.create(simulationData);
        return newSimulation;
    } catch (error) {
        throw new Error(`Error creating simulation: ${error.message}`);
    }
};

const getSimulationsByUser = async (userId) => {
    try {
        const simulations = await db.simulacao.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });
        return simulations;
    } catch (error) {
        throw new Error(`Error fetching simulations: ${error.message}`);
    }
};

const deleteSimulation = async (userId, simulationId) => {
    try {
        const deletedCount = await db.simulacao.destroy({
            where: {
                id: simulationId,
                userId: userId
            }
        });
        return deletedCount;
    } catch (error) {
        throw new Error(`Error deleting simulation: ${error.message}`);
    }
};

export default {
    createSimulation,
    getSimulationsByUser,
    deleteSimulation
};