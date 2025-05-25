export default (sequelize, Sequelize) => {
    const Simulacao = sequelize.define("simulacao", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        tipo: {
            type: Sequelize.ENUM('acao', 'renda-fixa'),
            allowNull: false
        },
        nome: {
            type: Sequelize.STRING,
            allowNull: false
        },
        valor: {
            type: Sequelize.FLOAT,
            allowNull: true // so é válido para tipo 'acao'
        },
        invest_inicial: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        invest_mensal: {
            type: Sequelize.FLOAT,
            allowNull: false
        },
        meses: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        inflacao: {
            type: Sequelize.FLOAT,
            allowNull: false
        }
    }, {
        tableName: 'simulacao'
    });

    return Simulacao;
};