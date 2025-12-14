"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Routes avec chemins spécifiques AVANT les routes avec paramètres
// Chiffre d'affaires journalier
router.get('/stats/daily-sales', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.getDailySales);
// Rapport Z
router.get('/stats/z-report', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.getZReport);
// Recherche par numéro de ticket
router.get('/search/ticket', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.searchByTicket);
// Vider le système (supprimer commandes payées/annulées)
router.delete('/system/clear', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.clearSystem);
// Serveur peut créer des commandes
router.post('/', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), orderController_1.OrderController.create);
// Serveur peut ajouter des articles à une commande existante
router.post('/:id/items', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), orderController_1.OrderController.addItems);
// Caissier, Admin et Serveur peuvent voir toutes les commandes
router.get('/', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN, types_1.UserRole.SERVEUR), orderController_1.OrderController.getAll);
router.get('/:id', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN, types_1.UserRole.SERVEUR), orderController_1.OrderController.getById);
// Caissier peut modifier et supprimer
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.update);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), orderController_1.OrderController.delete);
exports.default = router;
//# sourceMappingURL=orders.js.map