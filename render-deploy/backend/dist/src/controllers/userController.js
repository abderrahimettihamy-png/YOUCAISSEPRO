"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
class UserController {
    static async getAll(req, res) {
        try {
            const users = await (0, database_1.dbAll)('SELECT id, username, role, nom, prenom, lastLogin, isActive, createdAt FROM users');
            res.json(users);
        }
        catch (error) {
            console.error('Erreur getAll users:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async getStats(req, res) {
        try {
            // Statistiques globales
            const totalSales = await (0, database_1.dbGet)(`
        SELECT 
          COUNT(*) as totalOrders,
          COALESCE(SUM(CASE WHEN status = 'payee' THEN paidAmount ELSE 0 END), 0) as totalRevenue,
          COUNT(CASE WHEN status = 'en_attente' THEN 1 END) as openOrders
        FROM orders
        WHERE DATE(createdAt) = DATE('now')
      `);
            // Ventes par serveur
            const salesByServer = await (0, database_1.dbAll)(`
        SELECT 
          u.id,
          u.nom,
          u.prenom,
          u.isActive,
          COUNT(o.id) as orderCount,
          COALESCE(SUM(CASE WHEN o.status = 'payee' THEN o.paidAmount ELSE 0 END), 0) as revenue
        FROM users u
        LEFT JOIN orders o ON u.id = o.serveurId AND DATE(o.createdAt) = DATE('now')
        WHERE u.role = 'SERVEUR'
        GROUP BY u.id
        ORDER BY revenue DESC
      `);
            // Tables ouvertes
            const openTables = await (0, database_1.dbAll)(`
        SELECT 
          id,
          ticketNumber,
          notes as location,
          total,
          createdAt,
          (SELECT COUNT(*) FROM order_items WHERE orderId = orders.id) as itemCount
        FROM orders
        WHERE status = 'en_attente'
        ORDER BY createdAt DESC
      `);
            // Historique des 7 derniers jours
            const dailyHistory = await (0, database_1.dbAll)(`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as orderCount,
          COALESCE(SUM(CASE WHEN status = 'payee' THEN paidAmount ELSE 0 END), 0) as revenue
        FROM orders
        WHERE DATE(createdAt) >= DATE('now', '-7 days')
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `);
            res.json({
                totalSales,
                salesByServer,
                openTables,
                dailyHistory
            });
        }
        catch (error) {
            console.error('Erreur getStats:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async resetPassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;
            if (!newPassword) {
                return res.status(400).json({ error: 'Nouveau mot de passe requis' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            const result = await (0, database_1.dbRun)('UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, id]);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            res.json({ message: 'Mot de passe réinitialisé' });
        }
        catch (error) {
            console.error('Erreur resetPassword:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (userId) {
                // Marquer l'utilisateur comme inactif
                await (0, database_1.dbRun)('UPDATE users SET isActive = 0 WHERE id = ?', [userId]);
            }
            res.json({ message: 'Déconnexion réussie' });
        }
        catch (error) {
            console.error('Erreur logout:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = await (0, database_1.dbGet)('SELECT id, username, role, nom, prenom, createdAt FROM users WHERE id = ?', [id]);
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            res.json(user);
        }
        catch (error) {
            console.error('Erreur getById user:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { username, password, role, nom, prenom } = req.body;
            const updates = [];
            const values = [];
            if (username) {
                updates.push('username = ?');
                values.push(username);
            }
            if (password) {
                updates.push('password = ?');
                values.push(await bcryptjs_1.default.hash(password, 10));
            }
            if (role) {
                updates.push('role = ?');
                values.push(role);
            }
            if (nom) {
                updates.push('nom = ?');
                values.push(nom);
            }
            if (prenom) {
                updates.push('prenom = ?');
                values.push(prenom);
            }
            if (updates.length === 0) {
                return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
            }
            updates.push('updatedAt = CURRENT_TIMESTAMP');
            values.push(id);
            const result = await (0, database_1.dbRun)(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            res.json({ message: 'Utilisateur mis à jour' });
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Username déjà utilisé' });
            }
            console.error('Erreur update user:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.dbRun)('DELETE FROM users WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Utilisateur non trouvé' });
            }
            res.json({ message: 'Utilisateur supprimé' });
        }
        catch (error) {
            console.error('Erreur delete user:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map