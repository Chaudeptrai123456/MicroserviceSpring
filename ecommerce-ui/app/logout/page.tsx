"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/utils/axios.client";
import { API_PATHS } from "@/utils/apiPaths";

const backendApi = apiClient("BACKEND");

export default function LogoutButton() {
  const router = useRouter();
  const ctx = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  // Hàm xóa cookie ở phía client
  const clearClientCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Gọi API logout lên hệ thống backend để hủy session/token ở server
      await backendApi.post(API_PATHS.AUTH.LOGOUT);
    } catch (err) {
      console.error("Lỗi khi gọi API logout:", err);
    } finally {
      // 2. Xóa các token lưu trong Local Storage để hủy trạng thái "Remember me"
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      // Nếu bạn muốn giữ lại lịch sử tìm kiếm (search_history), ta chỉ xóa 2 key trên.
      // Trường hợp muốn xóa sạch toàn bộ localStorage, bạn có thể dùng: localStorage.clear();
      // 3. Xóa sạch cookie của client
      clearClientCookies();

      // 4. Đồng bộ lại thông tin user trong Context (nếu có)
      if (ctx?.refetchUser) {
        await ctx.refetchUser();
      }

      setLoading(false);

      // 5. Chuyển hướng người dùng về trang đăng nhập
      router.push("/login");
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
