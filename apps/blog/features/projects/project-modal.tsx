"use client";

import {
  IconButton,
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

type ProjectModalProps = {
  children: ReactNode;
  projectName: string;
};

export function ProjectModal({ children, projectName }: ProjectModalProps) {
  const router = useRouter();

  return (
    <Modal open onOpenChange={(open) => !open && router.back()}>
      <ModalPortal>
        <ModalOverlay className="project-modal-backdrop" />
        <ModalContent className="project-modal" size="lg">
          <ModalHeader className="project-modal__bar">
            <ModalTitle className="project-modal__title">{projectName}</ModalTitle>
            <div className="project-modal__bar-actions">
              <ModalClose asChild>
                <IconButton
                  aria-label="프로젝트 상세 닫기"
                  className="project-modal__close"
                  icon={<X aria-hidden="true" />}
                  size="md"
                  variant="secondary"
                />
              </ModalClose>
            </div>
          </ModalHeader>
          <ModalBody className="project-modal__scroll">{children}</ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
