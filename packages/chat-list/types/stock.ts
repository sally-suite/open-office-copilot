/**
 * Represents stock data for a specific time period.
 */
export type StockData = {
    /** The close price for the symbol in the given time period. */
    c: number;
    /** The highest price for the symbol in the given time period. */
    h: number;
    /** The lowest price for the symbol in the given time period. */
    l: number;
    /** The number of transactions in the aggregate window. */
    n: number;
    /** The open price for the symbol in the given time period. */
    o: number;
    /** The Unix Msec timestamp for the start of the aggregate window. */
    t: number;
    /** The trading volume of the symbol in the given time period. */
    v: number;
    /** The volume-weighted average price for the symbol in the given time period. */
    vw: number;
    /** Whether or not this aggregate is for an OTC ticker. This field will be left off if false. */
    otc?: boolean;
};
