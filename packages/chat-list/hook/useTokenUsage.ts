import { GPT_API_LIMIT_KEY } from "chat-list/config/constant";
import { IUsage } from "chat-list/types/usage";
import useUserProperty from "./useUserProperty";

interface TokenUsage {
    tokenUsage: number;
    addUsage: (usage: IUsage) => void;
}
export default function useTokenUsage(): TokenUsage {
    // const [, setUsage] = useState<IUsage>({ completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 });
    const { value: tokenUsage, setValue: setTokenUsage } = useUserProperty(GPT_API_LIMIT_KEY, 0);

    const addUsage = async (usage: IUsage) => {
        await setTokenUsage(Number(tokenUsage) + (usage?.total_tokens || 0));
    };

    return {
        tokenUsage: Number(tokenUsage),
        addUsage
    };
}