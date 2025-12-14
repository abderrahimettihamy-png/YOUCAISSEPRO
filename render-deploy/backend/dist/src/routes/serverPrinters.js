"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serverPrinterController_1 = require("../controllers/serverPrinterController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Routes accessibles uniquement aux SERVEUR
router.get('/my-printers', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), serverPrinterController_1.ServerPrinterController.getMyPrinters);
router.post('/save', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), serverPrinterController_1.ServerPrinterController.savePrinter);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), serverPrinterController_1.ServerPrinterController.deletePrinter);
router.post('/test', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), serverPrinterController_1.ServerPrinterController.testPrinter);
router.post('/print-ticket', (0, auth_1.authorize)(types_1.UserRole.SERVEUR), serverPrinterController_1.ServerPrinterController.printTicket);
exports.default = router;
//# sourceMappingURL=serverPrinters.js.map