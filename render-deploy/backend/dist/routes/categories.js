"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Admin et Caissier peuvent tout faire
router.post('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), categoryController_1.CategoryController.create);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), categoryController_1.CategoryController.update);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), categoryController_1.CategoryController.delete);
// Tout le monde authentifié peut voir
router.get('/', categoryController_1.CategoryController.getAll);
router.get('/:id', categoryController_1.CategoryController.getById);
exports.default = router;
//# sourceMappingURL=categories.js.map