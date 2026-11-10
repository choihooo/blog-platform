// Lucide v0 retains the GitHub/LinkedIn brand icons removed in v1.
import { Github, Linkedin, Mail, type LucideIcon } from "lucide-react";

export function FooterLinks({ linkedinUrl }: { linkedinUrl?: string }) {
  const links: { name: string; href: string; Icon: LucideIcon; external?: boolean }[] = [
    { name: "GitHub", href: "https://github.com/choihooo", Icon: Github, external: true },
    { name: "메일", href: "mailto:hochoi8621@gmail.com", Icon: Mail },
    ...(linkedinUrl ? [{ name: "LinkedIn", href: linkedinUrl, Icon: Linkedin, external: true }] : []),
  ];

  return (
    <div className="flex items-center gap-4">
      {links.map(({ Icon, ...link }) => (
        <a key={link.name} href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          aria-label={link.name} title={link.name}
          className="transition-colors hover:text-[#FF6F0F]">
          <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
