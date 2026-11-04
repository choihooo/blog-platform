import Link from "next/link";
import "./main-header.css";

export type MainSection = "about" | "blog" | "work";
const items: readonly { id: MainSection; label: string; href: string }[] = [
  { id: "about", label: "About", href: "/resume" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "work", label: "Portfolio", href: "/projects" },
];

export function MainHeader({
  active,
  className = "",
  onNavigate,
  onHome,
}: {
  active?: MainSection;
  className?: string;
  onNavigate?: (section: MainSection) => void;
  onHome?: () => void;
}) {
  return (
    <header
      className={`main-header ${onNavigate ? "main-header--scene" : "main-header--page"} ${className}`}
    >
      <Link
        className="main-header-brand"
        href="/"
        onClick={
          onHome
            ? (event) => {
                event.preventDefault();
                onHome();
              }
            : undefined
        }
      >
        HOZORICA
      </Link>
      <nav className="main-header-nav" aria-label={onNavigate ? "장면 이동" : "주요 메뉴"}>
        {items.map((item) =>
          onNavigate ? (
            <button
              key={item.id}
              className="main-header-item"
              type="button"
              aria-current={active === item.id ? "step" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.id}
              className="main-header-item"
              href={item.href}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}
