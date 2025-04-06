import { useRequest } from "@/request/hook";
import React, { createContext, useLayoutEffect, useState } from "react";

const OrderContext = createContext(null);

const OrderProvider = ({ children }: any) => {
  const { loading, data, reload } = useRequest("getOrders", {});

  return (
    <OrderContext.Provider value={{ loading, data, reload }}>
      {children}
    </OrderContext.Provider>
  );
};

export { OrderContext, OrderProvider };
