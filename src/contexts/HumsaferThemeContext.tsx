import { themeConfig } from "../configs/ConfigProvider";
import React, { createContext } from "react";

export const HumsaferThemeContext = createContext<ReturnType<typeof themeConfig>>(
  undefined!
);

export const HumsaferThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const config = themeConfig();
  return (
    <HumsaferThemeContext.Provider value={config}>
      {children}
    </HumsaferThemeContext.Provider>
  );
};
