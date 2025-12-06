import express from 'express';
import { PrinterController } from '../controllers/printerController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../../../shared/types';

const router = express.Router();

router.use(authenticate);

// Les ADMIN et CAISSIER peuvent gérer les imprimantes
router.get('/', authorize(UserRole.ADMIN, UserRole.CAISSIER), PrinterController.getAll);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.CAISSIER), PrinterController.getById);
router.post('/', authorize(UserRole.ADMIN, UserRole.CAISSIER), PrinterController.create);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.CAISSIER), PrinterController.update);
router.delete('/:id', authorize(UserRole.ADMIN, UserRole.CAISSIER), PrinterController.delete);

// Route pour récupérer l'imprimante d'une destination (accessible à tous)
router.get('/destination/:destination', authorize(UserRole.SERVEUR, UserRole.CAISSIER, UserRole.ADMIN), PrinterController.getByDestination);

export default router;
