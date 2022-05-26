import { BigNumber } from '@ethersproject/bignumber';

// chainId 42161
export function getInfoTokens_test() {
    return {
        '0x0000000000000000000000000000000000000000':
        {
            address: "0x0000000000000000000000000000000000000000",
            availableAmount: BigNumber.from('0x029f09e2fd51066cc567'),
            availableUsd: BigNumber.from('0x1d2c61d2dd37dfebfc958d950b51a800'),
            balance: BigNumber.from('0x00'),
            bufferAmount: BigNumber.from('0x021e19e0c9bab2400000'),
            cumulativeFundingRate: BigNumber.from('0x029882'),
            decimals: 18,
            fundingRate: BigNumber.from('0x13'),
            guaranteedUsd: BigNumber.from('0x0576267b9ad43e2816a7dacf7d20a5e6'),
            isNative: true,
            isShortable: true,
            managedAmount: BigNumber.from('0x031ca9cbd0cf8b985520'),
            managedUsd: BigNumber.from('0x22a2884e780c1e14133d686488724de6'),
            maxPrice: BigNumber.from('0x9a743ba0f1e2fcad647160000000'),
            maxUsdgAmount: BigNumber.from('0x31a17e847807b1bc000000'),
            minPrice: BigNumber.from('0x9a743ba0f1e2fcad647160000000'),
            name: "Ethereum",
            poolAmount: BigNumber.from('0x03407bd4f3cf089a0173'),
            redemptionAmount: BigNumber.from('0x012252acc6225e'),
            reservedAmount: BigNumber.from('0xa171f1f67e022d3c0c'),
            symbol: "ETH",
            usdgAmount: BigNumber.from('0x256236ef9f730d24f91a09'),
            weight: BigNumber.from('0x61a8'),
        },
        '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4':
        {
            address: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",
            availableAmount: BigNumber.from('0x22a4288db3ed74cf3a61'),
            availableUsd: BigNumber.from('0x021c94969dc6154639f27a08d29d3c00'),
            balance: BigNumber.from('0x00'),
            bufferAmount: BigNumber.from('0x152d02c7e14af6800000'),
            cumulativeFundingRate: BigNumber.from('0x039d65'),
            decimals: 18,
            fundingRate: BigNumber.from('0x22'),
            guaranteedUsd: BigNumber.from('0xcd10e174313890c8f1994d54fa2370'),
            isStable: false,
            managedAmount: BigNumber.from('0x2fc83db89f1f5f08bf48'),
            managedUsd: BigNumber.from('0x02e9a57811f74dd702e4135627975f70'),
            maxPrice: BigNumber.from('0xd8907cf33f5072f22570000000'),
            maxUsdgAmount: BigNumber.from('0x0422ca8b0a00a425000000'),
            minPrice: BigNumber.from('0xd8907cf33f5072f22570000000'),
            name: "Chainlink",
            poolAmount: BigNumber.from('0x34cf69b57e59921c7c6c'),
            redemptionAmount: BigNumber.from('0xcf0f08e3970f9b'),
            reservedAmount: BigNumber.from('0x122b4127ca6c1d4d420b'),
            symbol: "LINK",
            usdgAmount: BigNumber.from('0x032410c0655ca8d3ddd89a'),
            weight: BigNumber.from('0x1388'),
        }
    }
}

export const formatAmount = (
    amount,
    tokenDecimals,
    displayDecimals,
    useCommas,
    defaultValue
) => {
    if (!defaultValue) {
        defaultValue = "...";
    }
    if (amount === undefined || amount.toString().length === 0) {
        return defaultValue;
    }
    if (displayDecimals === undefined) {
        displayDecimals = 4;
    }
    let amountStr = ethers.utils.formatUnits(amount, tokenDecimals);
    amountStr = limitDecimals(amountStr, displayDecimals);
    if (displayDecimals !== 0) {
        amountStr = padDecimals(amountStr, displayDecimals);
    }
    if (useCommas) {
        return numberWithCommas(amountStr);
    }
    return amountStr;
};