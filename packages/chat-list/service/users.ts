
import { getPrivacyState, setPrivacyState } from 'chat-list/local/local';


export const getUserPrivacyState = async () => {
  const state = getPrivacyState();
  if (state == 'yes') {
    return true;
  }
  // state = await userApi.getUserProperty('sheet-chat-privacy-state');
  // setPrivacyState(state);
  // return state === 'yes';
  return false;
}

export const setUserPrivacyState = async (state: string) => {
  setPrivacyState(state);
  // await userApi.setUserProperty('sheet-chat-privacy-state', state);
}