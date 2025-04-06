import { ETH_TO_USE } from "@/constants/web3"

export const calcUsdToEth = (amount) => {
    return (amount * ETH_TO_USE).toFixed(5)
}

export const extractError = (text) => {
    const errorMatch = text.match(/^[^\[\()]*/);
    if (errorMatch && errorMatch.length > 0) return errorMatch[0];
    return text;
}