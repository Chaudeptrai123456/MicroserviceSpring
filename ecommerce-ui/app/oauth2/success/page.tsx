"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuth2Success() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      console.log("Login success!");
      router.push("/");
    } else {
      router.push("/login");
    }
  }, [router]);

  return <p>Đang đăng nhập...</p>;
}
