'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Camera,
  LayoutDashboard,
  Gift,
  SlidersHorizontal,
  Settings,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { adminLogoutAction } from './actions';

interface AdminNavbarProps {
  hasSession: boolean;
}

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Offers',
    href: '/admin/offers',
    icon: Gift,
    exact: false,
  },
  {
    name: 'Overrides',
    href: '/admin/overrides',
    icon: SlidersHorizontal,
    exact: false,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    exact: false,
  },
];

export default function AdminNavbar({ hasSession }: AdminNavbarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#09090b]/80 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5 md:gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <Link
            href="/admin"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(236,72,153,0.35)] ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-200">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 text-lg font-black tracking-tight">
                The Cinemoy
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-300 border border-pink-500/20">
                Admin
              </span>
            </div>
          </Link>

          {/* Quick View Site button on mobile if no session */}
          {!hasSession && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition-all"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          )}
        </div>

        {/* Center Navigation Links (When Logged In) */}
        {hasSession && (
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md shadow-inner shadow-black/40 overflow-x-auto max-w-full [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs md:text-sm transition-all duration-200 select-none ${
                    active
                      ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 text-white border border-pink-500/40 shadow-[0_0_15px_rgba(236,72,153,0.2)] font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] border border-transparent font-medium'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      active
                        ? 'text-pink-400 drop-shadow-[0_0_6px_rgba(244,114,182,0.6)]'
                        : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  />
                  <span>{item.name}</span>

                  {/* Active Indicator Pulse Dot */}
                  {active && (
                    <span className="relative flex h-1.5 w-1.5 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500 shadow-[0_0_6px_#ec4899]"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              !hasSession ? 'hidden md:inline-flex' : 'inline-flex'
            } items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-pink-300 hover:bg-white/[0.06] border border-white/10 hover:border-pink-500/30 px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm`}
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {hasSession && (
            <form action={adminLogoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
