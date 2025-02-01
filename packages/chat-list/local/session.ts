const SHEET_CHAT_CODE_EDIT = 'sheet-chat-code-edit';
const SHEET_CHAT_CHART_EDIT = 'sheet-chat-chart-edit';

export const setSessionStore = (key: string, value: any = {}) => {
  if (!value) {
    window.sessionStorage.removeItem(key);
  } else {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  }
};

export const getSessionStore = (key: string) => {
  const value = window.sessionStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const getCodeEditValue = () => {
  return getSessionStore(SHEET_CHAT_CODE_EDIT);
};

export const setCodeEditValue = (value = {}) => {
  return setSessionStore(SHEET_CHAT_CODE_EDIT, value);
};

export const getChartEditValue = () => {
  return getSessionStore(SHEET_CHAT_CHART_EDIT);
};

export const setChartEditValue = (value = {}) => {
  return setSessionStore(SHEET_CHAT_CHART_EDIT, value);
};