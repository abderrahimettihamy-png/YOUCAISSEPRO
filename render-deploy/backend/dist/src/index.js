"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
// import { checkLicense } from './utils/license'; // DÉSACTIVÉ pour les tests
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const orders_1 = __importDefault(require("./routes/orders"));
const categories_1 = __importDefault(require("./routes/categories"));
const products_1 = __importDefault(require("./routes/products"));
const printers_1 = __importDefault(require("./routes/printers"));
const print_1 = __importDefault(require("./routes/print"));
const reception_1 = __importDefault(require("./routes/reception"));
dotenv_1.default.config();
// ⚠️ VÉRIFICATION DE LA LICENCE - DÉSACTIVÉE POUR LES TESTS
// const licenseCheck = checkLicense();
// console.log('\n' + '═'.repeat(60));
// console.log(licenseCheck.message);
// console.log('═'.repeat(60) + '\n');
// if (!licenseCheck.valid) {
//   console.error('\n❌ ERREUR: Application non licenciée!');
//   console.error('   Contactez le support pour obtenir une licence.');
//   console.error('   Email: support@youcaisse.pro\n');
//   process.exit(1); // Arrêter l'application si pas de licence valide
// }
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialiser la base de données et démarrer le serveur
const startServer = async () => {
    try {
        await (0, database_1.initDatabase)();
        // Routes
        app.use('/api/auth', auth_1.default);
        app.use('/api/users', users_1.default);
        app.use('/api/orders', reception_1.default);
        app.use('/api/orders', orders_1.default);
        app.use('/api/categories', categories_1.default);
        app.use('/api/products', products_1.default);
        app.use('/api/printers', printers_1.default);
        app.use('/api/print', print_1.default);
        // Route de test
        app.get('/', (req, res) => {
            res.json({ message: 'YOU CAISSE PRO API - Serveur actif' });
        });
        // Gestion des erreurs 404
        app.use((req, res) => {
            res.status(404).json({ error: 'Route non trouvée' });
        });
        // Fonction pour obtenir l'adresse IP locale
        const getLocalIP = () => {
            const { networkInterfaces } = require('os');
            const nets = networkInterfaces();
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    // IPv4 et non interne
                    if (net.family === 'IPv4' && !net.internal) {
                        return net.address;
                    }
                }
            }
            return 'localhost';
        };
        app.listen(port, '0.0.0.0', () => {
            const localIP = getLocalIP();
            console.log(`🚀 Serveur démarré sur le port ${port}`);
            console.log(`📍 API disponible sur:`);
            console.log(`   - Local:  http://localhost:${port}`);
            console.log(`   - Réseau: http://${localIP}:${port}`);
            console.log(`\n💡 Pour connecter des tablettes/téléphones:`);
            console.log(`   Utilisez l'adresse réseau dans l'application`);
        });
    }
    catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
        process.exit(1);
    }
};
// Démarrer le serveur
startServer();
//# sourceMappingURL=index.js.map