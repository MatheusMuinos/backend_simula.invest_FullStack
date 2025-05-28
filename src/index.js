import express from "express";
import cors from "cors";
import db from "./models/index.js";
import userRoute from "./routes/user.route.js";
import simulacaoRoute from "./routes/simulacao.route.js";
import swaggerRoute from './routes/swagger.route.js';

const app = express();
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://legendary-dollop-6q7jp4qvqjv355gx-5173.app.github.dev',
        'https://simula-invest-full-stack-jbpj.vercel.app'
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

if (process.env.NODE_ENV !== 'test') {
    db.sequelize.sync()
        .then(() => {
            console.log("Database synced successfully.");
            app.listen(PORT, () => { // Use PORT here
                console.log(`Server is running on port http://localhost:${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Error starting server:", error);
            process.exit(1);
        });
}

export { app, db };