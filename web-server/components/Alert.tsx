"use client";
import { useRequest } from "@/request/hook";
import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Icon from "./Icon";
const AlertContext = createContext(null);

export type AlertType = "info" | "error" | "success";
const icons: { [x: string]: any } = {
  info: {
    icon: "ShieldAlert",
    color: "#1890ff",
  },
  error: {
    icon: "ShieldX",
    color: "#f5222d",
  },
  success: {
    icon: "ShieldCheck",
    color: "#52c41a",
  },
};
export interface IAlertSetting {
  title?: string;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

export interface IAlertState {
  info: (setting: IAlertSetting) => void;
  error: (setting: IAlertSetting) => void;
  success: (setting: IAlertSetting) => void;
}

const AlertProvider = ({ children }: any) => {
  const [type, setType] = useState<AlertType>("info");
  const [alertSetting, setAlertSetting] = useState<IAlertSetting>({});
  const [open, setOpen] = useState(false);
  function info(setting: IAlertSetting) {
    show("info", setting);
  }
  function error(setting: IAlertSetting) {
    show("error", setting);
  }
  function success(setting: IAlertSetting) {
    show("success", setting);
  }
  function show(type, setting) {
    setAlertSetting(setting);
    setType(type);
    setOpen(true);
  }
  const onOk = async (e) => {
    (await alertSetting.onOk) && alertSetting.onOk();
    setOpen(false);
  };
  const onCancel = () => {
    alertSetting.onCancel && alertSetting.onCancel();
    setOpen(false);
  };
  const {
    title = "",
    content = "",
    okText = "Ok",
    cancelText = "Cancel",
  } = alertSetting;

  return (
    <AlertContext.Provider value={{ open, info, error, success }}>
      {children}
      <AlertDialog open={open}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription className="flex flex-row items-start">
              <div>
                <Icon name={icons[type].icon} color={icons[type].color} />
              </div>
              <p>{content}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onOk}>
              {okText || "Ok"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
};
export function useAlert(): IAlertState {
  const context = useContext(AlertContext);
  return context;
}
export { AlertContext, AlertProvider };
