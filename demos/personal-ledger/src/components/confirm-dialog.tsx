"use client";
import { useBackLayer } from "../lib/navigation/use-back-layer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
export type Confirmation = {
  title: string;
  description: string;
  action: string;
  onConfirm: () => void;
};
export function ConfirmDialog({
  value,
  onClose,
}: {
  value: Confirmation | null;
  onClose: () => void;
}) {
  useBackLayer(!!value, onClose);
  return (
    <AlertDialog
      open={!!value}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{value?.title}</AlertDialogTitle>
          <AlertDialogDescription>{value?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              value?.onConfirm();
              onClose();
            }}
          >
            {value?.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
