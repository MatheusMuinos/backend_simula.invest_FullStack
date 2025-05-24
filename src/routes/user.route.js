import express from 'express';
import userController from '../controller/user.controller.js';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import secureController from '../controller/secure.controller.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/users', userController.getAllUsers);

export default router;
