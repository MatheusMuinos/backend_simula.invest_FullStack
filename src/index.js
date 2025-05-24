import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRoute from "./routes/user.route.js";
import simulacaoRoute from "./routes/simulacao.route.js";
import swaggerRoute from './routes/swagger.route.js';

db.sequelize.sync()
    .then(() => {
        console.log("Database synchronized");
    })
    .catch((error) => {
        console.error("Error synchronizing database:", error);
    });

const app = express();

app.use(cors({
  origin: '*', 
  credentials: true
}));

app.get('/', (req, res) => {
  res.send('Banco de Dados está no ar!');
});

app.use(express.json());
app.use(userRoute);
app.use(simulacaoRoute);
app.use(swaggerRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});

export { app };