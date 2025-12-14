"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const types_1 = require("../../../shared/types");
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ error: 'Username et password requis' });
            }
            const user = await (0, database_1.dbGet)('SELECT * FROM users WHERE username = ?', [username]);
            if (!user) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Identifiants invalides' });
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            // Mettre à jour lastLogin et isActive
            await (0, database_1.dbRun)('UPDATE users SET lastLogin = CURRENT_TIMESTAMP, isActive = 1 WHERE id = ?', [user.id]);
            // Créer une session
            await (0, database_1.dbRun)('INSERT INTO user_sessions (userId) VALUES (?)', [user.id]);
            res.json({
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    nom: user.nom,
                    prenom: user.prenom
                }
            });
        }
        catch (error) {
            console.error('Erreur login:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async register(req, res) {
        try {
            const { username, password, role, nom, prenom } = req.body;
            if (!username || !password || !role || !nom || !prenom) {
                return res.status(400).json({ error: 'Tous les champs sont requis' });
            }
            if (!Object.values(types_1.UserRole).includes(role)) {
                return res.status(400).json({ error: 'Rôle invalide' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const result = await (0, database_1.dbRun)('INSERT INTO users (username, password, role, nom, prenom) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, role, nom, prenom]);
            res.status(201).json({
                message: 'Utilisateur créé',
                userId: result.lastID
            });
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Username déjà utilisé' });
            }
            console.error('Erreur register:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map