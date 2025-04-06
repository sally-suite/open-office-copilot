
export enum OrderStatus {
    "Pending Payment",
    Active,
    Cancelled,
    Expired
}

export const CurrencySymbolMap: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: '$',
    AUD: '$',
    CNY: '¥'
};