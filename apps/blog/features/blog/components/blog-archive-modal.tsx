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

  function closeToRoom() {
    router.back();

    // A post/category view is one history entry deeper than the archive.
    // Return to the room as the window close action, while keeping the
    // separate "목록" link for the archive-level back action.
    window.setTimeout(() => {
      if (window.location.pathname !== "/") router.back();
    }, 400);

    let attempts = 0;
    const restoreFocus = () => {
      if (window.location.pathname !== "/") {
        if (attempts < 20) {
          attempts += 1;
          window.requestAnimationFrame(restoreFocus);
        }
        return;
      }
      const hotspot = document.querySelector<HTMLElement>('[data-hotspot="blog"]');
      if (hotspot) {
        hotspot.focus();
        return;
      }
      if (attempts < 12) {
        attempts += 1;
        window.requestAnimationFrame(restoreFocus);
      }
    };
    window.requestAnimationFrame(restoreFocus);
  }

  return (
    <Modal open onOpenChange={(open) => !open && closeToRoom()}>
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
                <button aria-label="블로그 창 닫기" className="blog-archive__close" type="button">
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
