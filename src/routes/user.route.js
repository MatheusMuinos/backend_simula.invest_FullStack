import express from 'express';
import userController from '../controller/user.controller.js';
import verifyToken from '../middlewares/jwt.token.middleware.js';
import secureController from '../controller/secure.controller.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', verifyToken, userController.login);
router.get('/users', verifyToken, userController.getAllUsers);
router.get('/secure', verifyToken, secureController.Endpoint);

export default router;
