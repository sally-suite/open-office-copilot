import { IChatMessage } from '../types/message';
import bus, { MessageCallback, SubscribeOption } from './bus';
const topic = 'public';

export const publish = async (message: IChatMessage) => {
    await bus.publishMessage(topic, message);
};
export const subscribe = async (callback: MessageCallback, option: SubscribeOption) => {
    await bus.subscribe(topic, callback, option);
};
export const unsubscribe = async (callback?: MessageCallback) => {
    await bus.unsubscribe(topic, callback);
};