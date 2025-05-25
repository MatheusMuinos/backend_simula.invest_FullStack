import express from 'express';
import userController from '@controller/user.controller.js';

const router = express.Router();

/**
* @swagger
* /register:
*   post:
*     summary: Registra um novo usuário
*     tags:
*       - Usuario
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*                 description: Nome de usuário do novo usuário.
*                 example: johndoe
*               password:
*                 type: string
*                 description: Senha do novo usuário.
*                 example: password123
*               email:
*                 type: string
*                 description: Email do novo usuário.
*                 example: johndoe@example.com
*     responses:
*       200:
*         description: Usuário registrado com sucesso.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*                   example: Usuário registrado com sucesso.
*       400:
*         description: Requisição inválida. Nome de usuário, senha e email são obrigatórios.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 code:
*                   type: string
*                   example: Register_Bad_Request
*                 message:
*                   type: string
*                   example: Username, password and email required
*/
router.post('/register', userController.register);

/**
* @swagger
* /login:
*   post:
*     summary: Realiza o login de um usuário
*     tags:
*       - Usuario
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               username:
*                 type: string
*                 description: Nome de usuário do usuário.
*                 example: johndoe
*               password:
*                 type: string
*                 description: Senha do usuário.
*                 example: password123
*     responses:
*       200:
*         description: Login realizado com sucesso.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 token:
*                   type: string
*                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*                 message:
*                   type: string
*                   example: Login realizado com sucesso.
*       400:
*         description: Requisição inválida. Nome de usuário e senha são obrigatórios.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 code:
*                   type: string
*                   example: Login_Bad_Request
*                 message:
*                   type: string
*                   example: Username and password required
*       401:
*         description: Credenciais inválidas.
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 code:
*                   type: string
*                   example: Login_Unauthorized
*                 message:
*                   type: string
*                   example: Invalid username or password
*/
router.post('/login', userController.login);

export default router;
