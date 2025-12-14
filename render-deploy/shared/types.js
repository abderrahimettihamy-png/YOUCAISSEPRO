"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterDestination = exports.PrinterType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CAISSIER"] = "CAISSIER";
    UserRole["SERVEUR"] = "SERVEUR";
    UserRole["RECEPTION"] = "RECEPTION";
})(UserRole || (exports.UserRole = UserRole = {}));
var PrinterType;
(function (PrinterType) {
    PrinterType["USB"] = "USB";
    PrinterType["NETWORK"] = "NETWORK";
})(PrinterType || (exports.PrinterType = PrinterType = {}));
var PrinterDestination;
(function (PrinterDestination) {
    PrinterDestination["BAR"] = "BAR";
    PrinterDestination["CUISINE"] = "CUISINE";
})(PrinterDestination || (exports.PrinterDestination = PrinterDestination = {}));
