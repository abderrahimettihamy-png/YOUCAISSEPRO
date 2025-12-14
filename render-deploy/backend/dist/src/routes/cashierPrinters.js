"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const cashierPrinterController_1 = require("../controllers/cashierPrinterController");
const router = express_1.default.Router();
// Toutes les routes nécessitent le rôle CAISSIER
router.get('/my-printers', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.getMyPrinters);
router.post('/save', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.savePrinter);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.deletePrinter);
router.post('/test', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.testPrinter);
router.post('/print-ticket', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.printTicket);
// Routes personnalisation
router.get('/customization', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.getCustomization);
router.post('/customization', (0, auth_1.authorize)(types_1.UserRole.CAISSIER), cashierPrinterController_1.CashierPrinterController.saveCustomization);
exports.default = router;
//# sourceMappingURL=cashierPrinters.js.map