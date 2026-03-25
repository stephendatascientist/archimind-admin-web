"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/api/client";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (tokenStorage.getAccess()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}
