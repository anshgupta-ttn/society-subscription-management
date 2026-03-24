"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const path = usePathname();

  const menu = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Flats", href: "/admin/flats" },
    { name: "Plans", href: "/admin/plans" },
    { name: "Payments", href: "/admin/payments" },
    { name: "Reports", href: "/admin/reports" },
    { name: "Profile", href: "/admin/profile" },
  ];

  return (
    <div className="w-64 bg-slate-900 min-h-screen p-4">

      <h1 className="text-xl font-bold mb-6">
        SocietyManagement
      </h1>

      <div className="flex flex-col gap-2">

        {menu.map((item) => (

          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded-lg cursor-pointer ${
              path === item.href
                ? "bg-slate-700"
                : "hover:bg-slate-800"
            }`}
          >
            {item.name}
          </Link>

        ))}

      </div>

    </div>
  );
}