"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
// Toutes les routes nécessitent l'authentification
router.use(auth_1.authenticate);
// Route de déconnexion accessible à tous
router.post('/logout', userController_1.UserController.logout);
// Routes admin uniquement
router.use((0, auth_1.authorize)(types_1.UserRole.ADMIN));
router.get('/stats/dashboard', userController_1.UserController.getStats);
router.get('/', userController_1.UserController.getAll);
router.get('/:id', userController_1.UserController.getById);
router.put('/:id', userController_1.UserController.update);
router.put('/:id/reset-password', userController_1.UserController.resetPassword);
router.delete('/:id', userController_1.UserController.delete);
exports.default = router;
//# sourceMappingURL=users.js.map