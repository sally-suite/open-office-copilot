import { gen } from 'chat-list/utils/api'
import api from '@api/api';

export type IAPIKeys = keyof typeof api;
export type IAPIFunction = {
  [_x in IAPIKeys]: ReturnType<typeof gen>;
};

const APIFunction = {} as IAPIFunction;
for (const key in api) {
  APIFunction[key as IAPIKeys] = gen(api[key as IAPIKeys]);
}

export default APIFunction;
