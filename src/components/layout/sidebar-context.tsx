"use client";

import * as React from "react";

const SidebarMobileContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function SidebarMobileProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);

  return <SidebarMobileContext.Provider value={value}>{children}</SidebarMobileContext.Provider>;
}

export function useSidebarMobile() {
  const context = React.useContext(SidebarMobileContext);
  if (!context) {
    throw new Error("useSidebarMobile must be used within a SidebarMobileProvider");
  }
  return context;
}
