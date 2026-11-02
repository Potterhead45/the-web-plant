"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { checkCurrentUser } from "@/store/slices/authSlice";
import { ToastContainer } from "@/components/ui/Toast";

const AppInit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    store.dispatch(checkCurrentUser());
  }, []);

  return (
    <>
      <ToastContainer />
      {children}
    </>
  );
};

export const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider store={store}>
      <AppInit>{children}</AppInit>
    </Provider>
  );
};
