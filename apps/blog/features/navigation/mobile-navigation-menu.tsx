"use client";

import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
} from "@hozui/react";
import {
  BriefcaseBusiness,
  CornerDownRight,
  FileText,
  FolderTree,
  Menu as MenuIcon,
  Newspaper,
  Tags,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { ThemeSwitch } from "./theme-switch";

export type MobileNavigationCategory = {
  label: string;
  parentSlug?: string | null;
  slug: string;
};

export function MobileNavigationMenu({ categories }: { categories: MobileNavigationCategory[] }) {
  const router = useRouter();
  const parents = categories.filter((category) => !category.parentSlug);
  const children = categories.filter((category) => category.parentSlug);

  function navigate(href: string) {
    router.push(href);
  }

  return (
    <div className="xl:hidden">
      <Menu>
        <MenuTrigger aria-label="메뉴 열기" className="size-11 px-0">
          <MenuIcon aria-hidden="true" size={20} />
        </MenuTrigger>
        <MenuContent
          align="end"
          className="max-h-[calc(100dvh-5rem)] overflow-y-auto"
          sideOffset={8}
        >
          <MenuItem icon={<UserRound size={16} />} onSelect={() => navigate("/about")}>
            소개
          </MenuItem>
          <MenuItem icon={<BriefcaseBusiness size={16} />} onSelect={() => navigate("/projects")}>
            프로젝트
          </MenuItem>
          <MenuItem icon={<Newspaper size={16} />} onSelect={() => navigate("/blog")}>
            블로그
          </MenuItem>
          <MenuItem icon={<FileText size={16} />} onSelect={() => navigate("/resume")}>
            이력서
          </MenuItem>
          <MenuItem icon={<Tags size={16} />} onSelect={() => navigate("/blog/tags")}>
            태그
          </MenuItem>

          <MenuSeparator />
          <MenuLabel icon={<FolderTree size={16} />}>카테고리</MenuLabel>
          <MenuItem onSelect={() => navigate("/blog")}>전체보기</MenuItem>
          {parents.map((parent) => (
            <MenuGroup key={parent.slug}>
              <MenuItem onSelect={() => navigate(`/blog/categories/${parent.slug}`)}>
                {parent.label}
              </MenuItem>
              {children
                .filter((child) => child.parentSlug === parent.slug)
                .map((child) => (
                  <MenuItem
                    className="pl-7"
                    icon={<CornerDownRight size={15} />}
                    key={child.slug}
                    onSelect={() => navigate(`/blog/categories/${child.slug}`)}
                  >
                    {child.label}
                  </MenuItem>
                ))}
            </MenuGroup>
          ))}

          <MenuSeparator />
          <div className="flex min-h-11 items-center px-3 py-1">
            <ThemeSwitch />
          </div>
        </MenuContent>
      </Menu>
    </div>
  );
}
