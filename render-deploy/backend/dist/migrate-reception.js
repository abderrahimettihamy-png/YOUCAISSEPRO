"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
async function migrateReception() {
    console.log('🔄 Migration: Ajout des champs réception...');
    try {
        // Vérifier si les colonnes existent déjà
        const tableInfo = await new Promise((resolve, reject) => {
            const sqlite3 = require('sqlite3');
            const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite');
            db.all("PRAGMA table_info(orders)", (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
        const hasRoomNumber = tableInfo.some((col) => col.name === 'roomNumber');
        const hasSentToReception = tableInfo.some((col) => col.name === 'sentToReception');
        const hasReceptionPrintedAt = tableInfo.some((col) => col.name === 'receptionPrintedAt');
        if (!hasRoomNumber) {
            await (0, database_1.dbRun)('ALTER TABLE orders ADD COLUMN roomNumber TEXT');
            console.log('✅ Colonne roomNumber ajoutée');
        }
        else {
            console.log('⏭️  Colonne roomNumber existe déjà');
        }
        if (!hasSentToReception) {
            await (0, database_1.dbRun)('ALTER TABLE orders ADD COLUMN sentToReception INTEGER DEFAULT 0');
            console.log('✅ Colonne sentToReception ajoutée');
        }
        else {
            console.log('⏭️  Colonne sentToReception existe déjà');
        }
        if (!hasReceptionPrintedAt) {
            await (0, database_1.dbRun)('ALTER TABLE orders ADD COLUMN receptionPrintedAt TEXT');
            console.log('✅ Colonne receptionPrintedAt ajoutée');
        }
        else {
            console.log('⏭️  Colonne receptionPrintedAt existe déjà');
        }
        console.log('✅ Migration terminée avec succès!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}
migrateReception();
//# sourceMappingURL=migrate-reception.js.map