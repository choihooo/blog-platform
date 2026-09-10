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

type BlogArchiveModalProps = {
  children: ReactNode;
  title?: string;
};

export function BlogArchiveModal({ children, title = "BLOG ARCHIVE" }: BlogArchiveModalProps) {
  const router = useRouter();

  return (
    <Modal open onOpenChange={(open) => !open && router.back()}>
      <ModalPortal>
        <ModalOverlay className="blog-archive-backdrop" />
        <ModalContent className="blog-archive-dialog" size="lg">
          <ModalHeader className="blog-archive__bar">
            <ModalTitle className="blog-archive__title">
              <span className="blog-archive__file-icon" aria-hidden="true">
                📄
              </span>
              {title}
            </ModalTitle>
            <div className="blog-archive__bar-actions">
              <span className="blog-archive__window-button" aria-hidden="true">
                —
              </span>
              <ModalClose asChild>
                <button
                  aria-label="블로그 아카이브 닫기"
                  className="blog-archive__close"
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </ModalClose>
            </div>
          </ModalHeader>
          <ModalBody className="blog-archive__body">{children}</ModalBody>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
