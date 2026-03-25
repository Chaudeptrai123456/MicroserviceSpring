"use client";

import TopBar from "@/components/owner/TopBar";
import RequireRole from "@/components/auth/RequireRole";
import Sidebar from "@/components/owner/SideBar";
export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="ROLE_OWNER">
      <div className="min-h-screen flex bg-gray-950">
        {" "}
        <div className="flex flex-1 ">
          <main className="flex-1 overflow-y-auto ">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
