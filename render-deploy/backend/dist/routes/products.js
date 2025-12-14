"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
// Admin et Caissier peuvent tout faire
router.post('/', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), productController_1.ProductController.create);
router.put('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), productController_1.ProductController.update);
router.delete('/:id', (0, auth_1.authorize)(types_1.UserRole.ADMIN, types_1.UserRole.CAISSIER), productController_1.ProductController.delete);
// Tout le monde authentifié peut voir
router.get('/', productController_1.ProductController.getAll);
router.get('/grouped', productController_1.ProductController.getByCategoryGrouped);
router.get('/:id', productController_1.ProductController.getById);
exports.default = router;
//# sourceMappingURL=products.js.map