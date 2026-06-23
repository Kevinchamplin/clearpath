"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./nav.module.css";

const links = [
  { href: "/", label: "🚦 ClearPath" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/report", label: "Report a Blockage" },
  { href: "/dispatch", label: "Dispatch View" },
];

const bottomNavLinks = [
  { href: "/", label: "Map", icon: "🗺" },
  { href: "/report", label: "Report", icon: "📋" },
  { href: "/how-it-works", label: "Info", icon: "ℹ" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav">
      {bottomNavLinks.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? "active" : ""}
        >
          <span className="nav-icon">{icon}</span>
          {label}
        </Link>
      ))}
      <Link
        href="/dispatch"
        className={`dispatch-btn${pathname === "/dispatch" ? " active" : ""}`}
      >
        <span className="nav-icon">🚨</span>
        Dispatch
      </Link>
    </nav>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          🚦 ClearPath
        </Link>

        <button
          className={styles.hamburger}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </button>

        <ul className={`${styles.links} ${open ? styles.linksOpen : ""}`}>
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={`${styles.link} ${pathname === href ? styles.active : ""}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
