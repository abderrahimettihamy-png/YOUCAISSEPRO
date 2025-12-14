"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const license_1 = require("./utils/license");
console.log('\n═══════════════════════════════════════════════════════');
console.log('    IDENTIFIANT MACHINE (MACHINE ID)');
console.log('═══════════════════════════════════════════════════════\n');
const machineId = (0, license_1.getMachineId)();
console.log('🖥️  MACHINE ID de cet ordinateur:');
console.log('─────────────────────────────────────────────────────');
console.log(machineId);
console.log('─────────────────────────────────────────────────────\n');
console.log('📧 Envoyez ce MACHINE ID au support pour obtenir');
console.log('   votre licence d\'activation.\n');
console.log('📞 Contact: support@youcaisse.pro\n');
//# sourceMappingURL=show-machine-id.js.map