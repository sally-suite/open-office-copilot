import userApi from '@api/user';

import React, { createContext, useCallback, useLayoutEffect, useState } from 'react';
import { IUserContextState, IUserState } from 'chat-list/types/user';
import { setLicenseConfig, setToken } from 'chat-list/local/local';
const UserContext = createContext<IUserContextState>(null);
const UserProvider = ({ children }: any) => {
  const [user, setUser] = useState<IUserState>(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openLogin, setOpenLogin] = useState(false);

  const checkUserState = async () => {
    try {
      setLoading(true);
      const userState = await userApi.checkUser();
      const { state, email, version, exp, gptLimit, interval, type, points } = userState;
      // debugger;
      setUser({
        ...user,
        type,
        email,
        state,
        version,
        exp,
        gptLimit,
        interval,
        username: email.split('@')[0],
        isAuthenticated: true,
      });
      if (userState.key) {
        setToken(userState.key);
      }
      setPoints(points);

    } catch (e) {
      if (e.code == 401) {
        window.location.href = '/auth/signin';
      }
      setUser({
        ...user,
        isAuthenticated: false
      });
    } finally {
      setLoading(false);
    }
  };
  const setUserState = useCallback(async (state = {}) => {
    setUser({
      ...user,
      ...state
    });
  }, [user]);

  const updatePoints = async () => {
    try {
      const points = await userApi.getPoints();
      if (typeof points !== 'undefined') {
        setPoints(points);
      }
    } catch (e) {
      console.log(e);
    }
  };


  const checkLicense = async (licenseKey: string) => {
    try {
      setLoading(true);
      const token = await userApi.login(licenseKey);
      setToken(token);
      await setLicenseConfig(licenseKey || '');
      const userState = await userApi.checkUser();
      const { state, email, version, exp, interval, type, points } = userState;
      setUser({
        ...user,
        type,
        email,
        state,
        version,
        exp,
        interval,
        username: email.split('@')[0],
        isAuthenticated: true
      });
      setPoints(points);
    } catch (e) {
      console.log(e.message);
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    checkUserState();
  }, []);

  if (!user) {
    return null;
  }
  return (
    <UserContext.Provider value={{
      loading,
      user,
      setUserState,
      points,
      updatePoints,
      checkLicense,
      openLogin,
      setOpenLogin
    }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
