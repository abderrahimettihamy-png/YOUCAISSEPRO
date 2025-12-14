"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Récupérer toutes les commandes envoyées à la réception, groupées par chambre
router.get('/reception', auth_1.authenticate, async (req, res) => {
    try {
        const orders = await (0, database_1.dbAll)(`
      SELECT 
        o.*,
        u.prenom || ' ' || u.nom as createdByName
      FROM orders o
      LEFT JOIN users u ON o.createdById = u.id
      WHERE o.sentToReception = 1
      ORDER BY o.roomNumber, o.createdAt DESC
    `);
        // Récupérer les items pour chaque commande
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await (0, database_1.dbAll)('SELECT * FROM order_items WHERE orderId = ?', [order.id]);
            return { ...order, items };
        }));
        // Grouper par numéro de chambre
        const roomGroups = {};
        ordersWithItems.forEach((order) => {
            const roomNumber = order.roomNumber || 'SANS_CHAMBRE';
            if (!roomGroups[roomNumber]) {
                roomGroups[roomNumber] = {
                    roomNumber,
                    orders: [],
                    totalAmount: 0
                };
            }
            const finalTotal = order.total - (order.discount || 0);
            roomGroups[roomNumber].orders.push({
                id: order.id,
                ticketNumber: order.ticketNumber,
                items: order.items,
                total: order.total,
                discount: order.discount || 0,
                finalTotal,
                status: order.status,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                receptionPrintedAt: order.receptionPrintedAt
            });
            roomGroups[roomNumber].totalAmount += finalTotal;
        });
        // Convertir en array
        const result = Object.values(roomGroups);
        res.json(result);
    }
    catch (error) {
        console.error('Erreur récupération réception:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Envoyer une commande à la réception
router.post('/:orderId/send-reception', auth_1.authenticate, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { roomNumber } = req.body;
        if (!roomNumber) {
            return res.status(400).json({ error: 'Numéro de chambre requis' });
        }
        await (0, database_1.dbRun)('UPDATE orders SET sentToReception = 1, roomNumber = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [roomNumber, orderId]);
        res.json({ success: true, message: 'Commande envoyée à la réception' });
    }
    catch (error) {
        console.error('Erreur envoi réception:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Marquer une chambre comme imprimée
router.post('/reception/:roomNumber/print', auth_1.authenticate, async (req, res) => {
    try {
        const { roomNumber } = req.params;
        await (0, database_1.dbRun)('UPDATE orders SET receptionPrintedAt = CURRENT_TIMESTAMP WHERE roomNumber = ? AND sentToReception = 1', [roomNumber]);
        res.json({ success: true, message: 'Marqué comme imprimé' });
    }
    catch (error) {
        console.error('Erreur marquage impression:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
exports.default = router;
//# sourceMappingURL=reception.js.map