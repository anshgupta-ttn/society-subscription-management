"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard");
  }, [router]);

  return null; 
}