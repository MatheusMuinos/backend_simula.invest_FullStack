import simulacaoService from '../services/simulacao.service.js';

const logSimulation = async (req, res) => {
    try {
        const { userId, tipo, nome, valor, invest_inicial, invest_mensal, meses, inflacao } = req.body;
        
        if (!tipo || !nome || !invest_inicial || !invest_mensal || !meses || !inflacao) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (tipo === 'acao' && !valor) {
            return res.status(400).json({ message: "Value is required for stock simulations" });
        }

        const simulation = await simulacaoService.createSimulation({
            userId: req.userId,
            tipo,
            nome,
            valor,
            invest_inicial,
            invest_mensal,
            meses,
            inflacao
        });

        res.status(201).json(simulation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSimulations = async (req, res) => {
    try {
        const simulations = await simulacaoService.getSimulationsByUser(req.userId);
        res.status(200).json(simulations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSimulations = async (req, res) => {
    try {
        const { simulationId } = req.body;
        
        if (!simulationId) {
            return res.status(400).json({ message: "Simulation ID is required" });
        }

        const deletedCount = await simulacaoService.deleteSimulation(req.userId, simulationId);
        
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Simulation not found or not owned by user" });
        }

        res.status(200).json({ message: "Simulation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    logSimulation,
    getSimulations,
    deleteSimulations
};