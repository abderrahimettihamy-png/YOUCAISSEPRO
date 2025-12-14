export declare function getMachineId(): string;
export declare function generateLicense(machineId: string, expiryDays?: number): string;
export declare function verifyLicense(license: string): {
    valid: boolean;
    error?: string;
    expiryDate?: Date;
};
export declare function saveLicense(license: string): boolean;
export declare function loadLicense(): string | null;
export declare function checkLicense(): {
    valid: boolean;
    message: string;
};
//# sourceMappingURL=license.d.ts.map