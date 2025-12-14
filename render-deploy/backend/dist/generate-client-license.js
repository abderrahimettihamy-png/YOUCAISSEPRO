"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const license_1 = require("./utils/license");
const readline = __importStar(require("readline"));
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
async function main() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('    GÉNÉRATEUR DE LICENCE POUR CLIENT');
    console.log('═══════════════════════════════════════════════════════\n');
    // Demander le Machine ID du client
    console.log('📋 Le client doit d\'abord vous envoyer son MACHINE ID');
    console.log('   Pour l\'obtenir, il doit exécuter: npm run show-machine-id\n');
    const machineId = await question('🔑 Entrez le MACHINE ID du client: ');
    if (!machineId || machineId.trim().length === 0) {
        console.error('\n❌ Machine ID invalide!');
        rl.close();
        process.exit(1);
    }
    const daysInput = await question('\n📅 Durée de la licence (jours) [365 par défaut]: ');
    const days = parseInt(daysInput) || 365;
    // Générer la licence
    const license = (0, license_1.generateLicense)(machineId.trim(), days);
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ LICENCE GÉNÉRÉE AVEC SUCCÈS!');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📦 LICENCE À ENVOYER AU CLIENT:');
    console.log('─────────────────────────────────────────────────────');
    console.log(license);
    console.log('─────────────────────────────────────────────────────\n');
    console.log('📧 Instructions pour le client:');
    console.log('   1. Créer le dossier: backend\\.license\\');
    console.log('   2. Créer le fichier: backend\\.license\\license.key');
    console.log('   3. Copier la licence ci-dessus dans ce fichier');
    console.log('   4. Relancer l\'application avec DEMARRER.bat\n');
    console.log(`⏰ Validité: ${days} jours\n`);
    rl.close();
}
main().catch(console.error);
//# sourceMappingURL=generate-client-license.js.map