"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const database_1 = require("../config/database");
class CategoryController {
    static async create(req, res) {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Le nom est requis' });
            }
            const result = await (0, database_1.dbRun)('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || null]);
            res.status(201).json({
                message: 'Catégorie créée',
                categoryId: result.lastID
            });
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Cette catégorie existe déjà' });
            }
            console.error('Erreur create category:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async getAll(req, res) {
        try {
            const categories = await (0, database_1.dbAll)(`
        SELECT c.*, COUNT(p.id) as productCount 
        FROM categories c
        LEFT JOIN products p ON c.id = p.categoryId
        GROUP BY c.id
        ORDER BY c.name
      `);
            res.json(categories);
        }
        catch (error) {
            console.error('Erreur getAll categories:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const category = await (0, database_1.dbGet)('SELECT * FROM categories WHERE id = ?', [id]);
            if (!category) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            const products = await (0, database_1.dbAll)('SELECT * FROM products WHERE categoryId = ?', [id]);
            res.json({ ...category, products });
        }
        catch (error) {
            console.error('Erreur getById category:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;
            const updates = [];
            const values = [];
            if (name) {
                updates.push('name = ?');
                values.push(name);
            }
            if (description !== undefined) {
                updates.push('description = ?');
                values.push(description);
            }
            if (updates.length === 0) {
                return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
            }
            updates.push('updatedAt = CURRENT_TIMESTAMP');
            values.push(id);
            const result = await (0, database_1.dbRun)(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            res.json({ message: 'Catégorie mise à jour' });
        }
        catch (error) {
            if (error.code === 'SQLITE_CONSTRAINT') {
                return res.status(409).json({ error: 'Ce nom de catégorie existe déjà' });
            }
            console.error('Erreur update category:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await (0, database_1.dbRun)('DELETE FROM categories WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ error: 'Catégorie non trouvée' });
            }
            res.json({ message: 'Catégorie supprimée' });
        }
        catch (error) {
            console.error('Erreur delete category:', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=categoryController.js.map