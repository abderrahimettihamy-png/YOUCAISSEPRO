"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThermalPrintService = void 0;
const node_thermal_printer_1 = require("node-thermal-printer");
class ThermalPrintService {
    /**
     * Imprime un ticket sur une imprimante thermique
     */
    static async printTicket(printerConfig, ticketData) {
        try {
            let printer;
            if (printerConfig.type === 'USB') {
                // Configuration USB
                printer = new node_thermal_printer_1.ThermalPrinter({
                    type: node_thermal_printer_1.PrinterTypes.EPSON,
                    interface: printerConfig.usbPort || 'printer',
                    removeSpecialCharacters: false,
                    lineCharacter: '=',
                    options: {
                        timeout: 5000
                    }
                });
            }
            else {
                // Configuration Réseau
                printer = new node_thermal_printer_1.ThermalPrinter({
                    type: node_thermal_printer_1.PrinterTypes.EPSON,
                    interface: `tcp://${printerConfig.networkIp}:${printerConfig.networkPort || 9100}`,
                    removeSpecialCharacters: false,
                    lineCharacter: '=',
                    options: {
                        timeout: 5000
                    }
                });
            }
            // Construction du ticket
            printer.alignCenter();
            printer.setTextSize(1, 1);
            printer.bold(true);
            printer.println('================================');
            printer.println(ticketData.destination);
            printer.println('================================');
            printer.bold(false);
            printer.newLine();
            printer.alignLeft();
            printer.println(`Ticket: ${ticketData.ticketNumber}`);
            printer.println(`Client: ${ticketData.clientName}`);
            if (ticketData.mealTime) {
                printer.println(`⏰ Heure: ${ticketData.mealTime}`);
            }
            printer.println(`Serveur: ${ticketData.serveur}`);
            printer.println(`Date: ${new Date(ticketData.createdAt).toLocaleString('fr-FR')}`);
            if (ticketData.notes && ticketData.notes.trim()) {
                printer.drawLine();
                printer.println('NOTES:');
                printer.println(ticketData.notes.trim());
            }
            printer.drawLine();
            // Articles
            for (const item of ticketData.items) {
                printer.bold(true);
                printer.print(`${item.quantity}x `);
                printer.bold(false);
                printer.println(item.productName);
                if (item.productName.length > 30) {
                    printer.println('');
                }
            }
            printer.drawLine();
            printer.alignCenter();
            printer.setTextSize(1, 1);
            printer.bold(true);
            printer.println(`${ticketData.items.length} ARTICLE(S)`);
            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.newLine();
            printer.cut();
            // Exécution de l'impression
            await printer.execute();
            console.log(`✅ Ticket imprimé sur ${printerConfig.name} (${ticketData.destination})`);
            return true;
        }
        catch (error) {
            console.error(`❌ Erreur impression sur ${printerConfig.name}:`, error);
            return false;
        }
    }
    /**
     * Test d'impression simple
     */
    static async testPrint(printerConfig) {
        try {
            let printer;
            if (printerConfig.type === 'USB') {
                printer = new node_thermal_printer_1.ThermalPrinter({
                    type: node_thermal_printer_1.PrinterTypes.EPSON,
                    interface: printerConfig.usbPort || 'printer',
                    removeSpecialCharacters: false,
                    lineCharacter: '=',
                    options: {
                        timeout: 5000
                    }
                });
            }
            else {
                printer = new node_thermal_printer_1.ThermalPrinter({
                    type: node_thermal_printer_1.PrinterTypes.EPSON,
                    interface: `tcp://${printerConfig.networkIp}:${printerConfig.networkPort || 9100}`,
                    removeSpecialCharacters: false,
                    lineCharacter: '=',
                    options: {
                        timeout: 5000
                    }
                });
            }
            // Ticket de test
            printer.alignCenter();
            printer.setTextSize(1, 1);
            printer.bold(true);
            printer.println('================================');
            printer.println('TEST D\'IMPRESSION');
            printer.println('================================');
            printer.bold(false);
            printer.newLine();
            printer.alignLeft();
            printer.println(`Imprimante: ${printerConfig.name}`);
            printer.println(`Destination: ${printerConfig.destination}`);
            printer.println(`Type: ${printerConfig.type}`);
            if (printerConfig.type === 'USB') {
                printer.println(`Port: ${printerConfig.usbPort}`);
            }
            else {
                printer.println(`IP: ${printerConfig.networkIp}:${printerConfig.networkPort}`);
            }
            printer.println(`Date: ${new Date().toLocaleString('fr-FR')}`);
            printer.drawLine();
            printer.println('Article de test:');
            printer.println('  1x Cafe                 3.50 MAD');
            printer.println('  2x Croissant           10.00 MAD');
            printer.drawLine();
            printer.alignRight();
            printer.bold(true);
            printer.println('TOTAL:      13.50 MAD');
            printer.bold(false);
            printer.newLine();
            printer.alignCenter();
            printer.setTextSize(1, 1);
            printer.bold(true);
            printer.println('TEST REUSSI !');
            printer.bold(false);
            printer.newLine();
            printer.newLine();
            printer.newLine();
            printer.cut();
            await printer.execute();
            console.log(`✅ Test d'impression réussi sur ${printerConfig.name}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Erreur test impression sur ${printerConfig.name}:`, error);
            return false;
        }
    }
}
exports.ThermalPrintService = ThermalPrintService;
//# sourceMappingURL=thermalPrintService.js.map