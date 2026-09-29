import Big from 'big.js';
import type { RollupSummary } from '../types/boq';

Big.DP = 2;
Big.RM = Big.roundHalfUp;

export const safeMul = (a: number | string, b: number | string): number => {
    try {
        return Number(new Big(a || 0).mul(new Big(b || 0)).toFixed(2));
    } catch {
        return 0;
    }
};

export const safeAdd = (a: number | string, b: number | string): number => {
    try {
        return Number(new Big(a || 0).plus(new Big(b || 0)).toFixed(2));
    } catch {
        return 0;
    }
};

export const calculateRollup = (
    directSum: number,
    overheadPct: number,
    profitPct: number,
    taxPct: number
): RollupSummary => {
    try {
        const directTotal = new Big(directSum || 0);

        const overheadAmount = directTotal.mul(new Big(overheadPct || 0).div(100));
        const subtotalWithOverhead = directTotal.plus(overheadAmount);

        const profitAmount = subtotalWithOverhead.mul(new Big(profitPct || 0).div(100));
        const netTotal = subtotalWithOverhead.plus(profitAmount);

        const taxAmount = netTotal.mul(new Big(taxPct || 0).div(100));
        const grandTotal = netTotal.plus(taxAmount);

        return {
            directTotal: Number(directTotal.toFixed(2)),
            overheadAmount: Number(overheadAmount.toFixed(2)),
            profitAmount: Number(profitAmount.toFixed(2)),
            taxAmount: Number(taxAmount.toFixed(2)),
            grandTotal: Number(grandTotal.toFixed(2))
        };
    } catch {
        return { directTotal: 0, overheadAmount: 0, profitAmount: 0, taxAmount: 0, grandTotal: 0 };
    }
};