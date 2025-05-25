import express from "express";
import cors from "cors";
import db from "@models/index.js";
import userRoute from "@routes/user.route.js";
import simulacaoRoute from "@routes/simulacao.route.js";
import swaggerRoute from '@routes/swagger.route.js';

const app = express();

app.use(cors({
  origin: '*', 
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Banco de Dados está no ar!');
});

app.use(userRoute);
app.use(simulacaoRoute);
app.use(swaggerRoute);

const PORT = process.env.PORT || 3000;

const isTest = process.env.JEST_WORKER_ID !== undefined || process.env.NODE_ENV === 'test';

if (!isTest) {
    console.log("Starting server and synchronizing database...");
    db.sequelize.sync()
        .then(() => {
            console.log("Database synchronized.");
            app.listen(PORT, () => {
                console.log(`Servidor rodando na porta http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Error starting server:", error);
        });
}

export { app };