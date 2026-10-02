import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { DetailPage } from "./pages/DetailPage";
import { IntakePage } from "./pages/IntakePage";
import { ShortlistPage } from "./pages/ShortlistPage";
import { useSession } from "./state/SessionProvider";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RequireContext({ children }: { children: ReactNode }) {
  const { context } = useSession();
  if (!context) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
    <Routes>
      <Route path="/" element={<IntakePage />} />
      <Route
        path="/catalog"
        element={
          <RequireContext>
            <CatalogPage />
          </RequireContext>
        }
      />
      <Route
        path="/shortlist"
        element={
          <RequireContext>
            <ShortlistPage />
          </RequireContext>
        }
      />
      <Route
        path="/items/:id"
        element={
          <RequireContext>
            <DetailPage />
          </RequireContext>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
