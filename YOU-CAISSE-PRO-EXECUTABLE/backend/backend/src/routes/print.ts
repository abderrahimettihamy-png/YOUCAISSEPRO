import express from 'express';
import { PrintController } from '../controllers/printController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../../../shared/types';

const router = express.Router();

router.use(authenticate);

// Routes d'impression (SERVEUR peut déclencher l'impression de ses commandes)
router.post('/order', authorize(UserRole.SERVEUR, UserRole.CAISSIER, UserRole.ADMIN), PrintController.printOrder);

// Récupérer les tickets séparés BAR/CUISINE
router.get('/order/:orderId/tickets', authorize(UserRole.SERVEUR, UserRole.CAISSIER, UserRole.ADMIN), PrintController.getTicketsByDestination);

export default router;
