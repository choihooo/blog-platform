"use client";

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
} from "@hozui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ResumeModalProps = {
  children: ReactNode;
};

export function ResumeModal({ children }: ResumeModalProps) {
  const router = useRouter();

  return (
    <Modal open onOpenChange={(open) => !open && router.back()}>
      <ModalPortal>
        <ModalOverlay className="resume-modal-backdrop" />
        <ModalContent className="resume-modal" size="lg">
          <ModalHeader className="resume-modal__bar">
            <ModalTitle className="resume-modal__title">ABOUT / 최호</ModalTitle>
            <ModalClose asChild>
              <button aria-label="About 닫기" className="resume-modal__close" type="button">
                <X aria-hidden="true" />
              </button>
            </ModalClose>
          </ModalHeader>
          <ModalBody className="resume-modal__scroll">{children}</ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
