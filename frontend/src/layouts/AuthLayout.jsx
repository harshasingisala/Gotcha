import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return <div className="grid min-h-screen place-items-center bg-page p-6"><div className="w-full max-w-md rounded-xl border border-surface-strong bg-white p-8 shadow-soft"><Outlet /></div></div>;
}
