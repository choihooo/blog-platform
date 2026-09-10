"use client";

import {
  Modal,
  ModalBody,
  ModalClose,
  ModalContent,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
} from "@hozui/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ProjectFeedModalProps = {
  children: ReactNode;
};

export function ProjectFeedModal({ children }: ProjectFeedModalProps) {
  const router = useRouter();

  return (
    <Modal open onOpenChange={(open) => !open && router.back()}>
      <ModalPortal>
        <ModalOverlay className="work-feed-backdrop" />
        <ModalContent className="work-feed-modal" size="lg">
          <ModalTitle className="sr-only">Work 프로젝트 피드</ModalTitle>
          <ModalClose asChild>
            <button aria-label="Work 피드 닫기" className="work-feed-modal__close" type="button">
              <X aria-hidden="true" />
            </button>
          </ModalClose>
          <ModalBody className="work-feed-modal__body">{children}</ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
