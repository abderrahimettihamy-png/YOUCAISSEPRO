"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const printerController_1 = require("../controllers/printerController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Les ADMIN, CAISSIER et SERVEUR peuvent gérer les imprimantes
router.get('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.getAll);
router.get('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.getById);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.create);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.update);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.delete);
// Route pour récupérer l'imprimante d'une destination (accessible à tous)
router.get('/destination/:destination', (0, auth_1.authorize)(types_1.UserRole.SERVEUR, types_1.UserRole.CAISSIER, types_1.UserRole.ADMIN), printerController_1.PrinterController.getByDestination);
// Route pour tester une imprimante
router.post('/:id/test', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER, types_1.UserRole.SERVEUR), printerController_1.PrinterController.testPrint);
exports.default = router;
//# sourceMappingURL=printers.js.map