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
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type ProjectModalProps = {
  children: ReactNode;
  nextProject?: ProjectModalLink;
  previousProject?: ProjectModalLink;
  projectName: string;
};

type ProjectModalLink = {
  name: string;
  slug: string;
};

export function ProjectModal({
  children,
  nextProject,
  previousProject,
  projectName,
}: ProjectModalProps) {
  const router = useRouter();

  const navigate = (project?: ProjectModalLink) => {
    if (project) router.push(`/projects/${project.slug}`);
  };

  return (
    <Modal open onOpenChange={(open) => !open && router.back()}>
      <ModalPortal>
        <ModalOverlay className="project-modal-backdrop" />
        <ModalContent className="project-modal" size="lg">
          <ModalHeader className="project-modal__bar">
            <ModalTitle className="project-modal__title">{projectName}</ModalTitle>
            <div className="project-modal__bar-actions">
              <div className="project-modal__mobile-navigation">
                <IconButton
                  aria-label={
                    previousProject
                      ? `이전 프로젝트 ${previousProject.name} 보기`
                      : "이전 프로젝트 없음"
                  }
                  disabled={!previousProject}
                  icon={<ChevronLeft aria-hidden="true" />}
                  onClick={() => navigate(previousProject)}
                  size="md"
                  variant="secondary"
                />
                <IconButton
                  aria-label={
                    nextProject ? `다음 프로젝트 ${nextProject.name} 보기` : "다음 프로젝트 없음"
                  }
                  disabled={!nextProject}
                  icon={<ChevronRight aria-hidden="true" />}
                  onClick={() => navigate(nextProject)}
                  size="md"
                  variant="secondary"
                />
              </div>
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
          <nav aria-label="프로젝트 이전 및 다음 이동" className="project-modal__navigation">
            <IconButton
              aria-label={
                previousProject
                  ? `이전 프로젝트 ${previousProject.name} 보기`
                  : "이전 프로젝트 없음"
              }
              className="project-modal__navigation-button"
              disabled={!previousProject}
              icon={<ChevronLeft aria-hidden="true" />}
              onClick={() => navigate(previousProject)}
              size="lg"
              variant="secondary"
            />
            <IconButton
              aria-label={
                nextProject ? `다음 프로젝트 ${nextProject.name} 보기` : "다음 프로젝트 없음"
              }
              className="project-modal__navigation-button"
              disabled={!nextProject}
              icon={<ChevronRight aria-hidden="true" />}
              onClick={() => navigate(nextProject)}
              size="lg"
              variant="secondary"
            />
          </nav>
        </ModalContent>
      </ModalPortal>
    </Modal>
  );
}
