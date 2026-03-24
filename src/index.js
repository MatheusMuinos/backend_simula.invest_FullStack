import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRoute from "./routes/user.route.js";
import simulacaoRoute from "./routes/simulacao.route.js";
import swaggerRoute from './routes/swagger.route.js';

db.sequelize.sync()
    .then(() => {
        console.log("Database synced successfully.");
    })
.catch((error) => {
    console.error("Error syncing database:", error);
});

const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173', // Front Local
    'http://localhost:3000', // Back Local
    'https://verbose-capybara-wrgr7qr7w9j4h5g7r-5173.app.github.dev', // Front Teste Matheus
    'https://simula-invest-full-stack-jbpj.vercel.app' // Front Vercel (nao tirar nunca)
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(userRoute);
app.use(simulacaoRoute);
app.use(swaggerRoute);

app.get('/', (req, res) => {
    res.send({message: 'Hello World!'});
});

const PORT = process.env.PORT || 3000;

app.listen(3000, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
