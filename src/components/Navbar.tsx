import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, BookOpen, Sparkles, Trophy, BookMarked, LogIn, LogOut, Shield, Menu, X, User, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SmartLink } from "@/components/SmartLink";

const navItems = [
  { to: "/", label: "الرئيسية", icon: Sparkles },
  { to: "/morning", label: "أذكار الصباح", icon: Sun },
  { to: "/evening", label: "أذكار المساء", icon: Moon },
  { to: "/duas", label: "الأدعية", icon: BookMarked },
  { to: "/tasbih", label: "السبحة", icon: CircleDot },
  { to: "/quran", label: "القرآن", icon: BookOpen },
  { to: "/quiz", label: "الاختبار", icon: Trophy },
];

export function Navbar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-primary">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-emerald shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span>نور الإيمان</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <SmartLink
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </SmartLink>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <Shield className="h-4 w-4" />
                لوحة التحكم
              </Link>
            </Button>
          )}
          {user ? (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  حسابي
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
                خروج
              </Button>
            </>
          ) : (
            <Button asChild variant="emerald" size="sm">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                دخول
              </Link>
            </Button>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-1">
          <button
            className="rounded-lg p-2 hover:bg-muted"
            onClick={() => setOpen(!open)}
            aria-label="القائمة"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/40 bg-background">
          <nav className="container flex flex-col gap-1 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.to;
              return (
                <SmartLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-smooth",
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </SmartLink>
              );
            })}
            <div className="flex gap-2 pt-2 border-t border-border mt-2">
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/admin" onClick={() => setOpen(false)}>
                    <Shield className="h-4 w-4" /> الإدارة
                  </Link>
                </Button>
              )}
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/profile" onClick={() => setOpen(false)}>
                      <User className="h-4 w-4" /> حسابي
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={signOut} className="flex-1">
                    <LogOut className="h-4 w-4" /> خروج
                  </Button>
                </>
              ) : (
                <Button asChild variant="emerald" size="sm" className="flex-1">
                  <Link to="/auth" onClick={() => setOpen(false)}>
                    <LogIn className="h-4 w-4" /> دخول
                  </Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
