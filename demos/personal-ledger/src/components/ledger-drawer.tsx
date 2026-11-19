"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useBackLayer } from "../lib/navigation/use-back-layer";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "./ui/drawer";
const DrawerDepth = createContext(false);
export function LedgerDrawer({
  open,
  onClose,
  title,
  children,
  autoFocus = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  autoFocus?: boolean;
}) {
  useBackLayer(open, onClose);
  const nested = useContext(DrawerDepth);
  return (
    <DrawerDepth.Provider value={true}>
      <Drawer
        autoFocus={autoFocus}
        nested={nested}
        open={open}
        onOpenChange={(value) => {
          if (!value) onClose();
        }}
        shouldScaleBackground={false}
        repositionInputs={false}
        handleOnly
      >
        <DrawerContent>
          <div className="sheet-body">
            <div className="sheet-header">
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerClose className="icon-btn" aria-label="닫기">
                <X />
              </DrawerClose>
            </div>
            <DrawerDescription className="sr-only">
              {title} 정보를 입력하고 저장하세요. 아래로 끌거나 닫기 버튼으로
              닫을 수 있어요.
            </DrawerDescription>
            {children}
          </div>
        </DrawerContent>
      </Drawer>
    </DrawerDepth.Provider>
  );
}
