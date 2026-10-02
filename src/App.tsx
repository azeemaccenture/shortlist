import { useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { CatalogPage } from "./pages/CatalogPage";
import { DetailPage } from "./pages/DetailPage";
import { IntakePage } from "./pages/IntakePage";
import { AgencyPage } from "./pages/AgencyPage";
import { PortalHome } from "./pages/PortalHome";
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
  const { clientId } = useParams();
  if (!context) return <Navigate to={clientId ? `/clients/${clientId}/intake` : "/"} replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
    <Routes>
      <Route path="/" element={<AgencyPage />} />
      <Route path="/clients/:clientId" element={<PortalHome />} />
      <Route path="/clients/:clientId/intake" element={<IntakePage />} />
      <Route
        path="/clients/:clientId/catalog"
        element={
          <RequireContext>
            <CatalogPage />
          </RequireContext>
        }
      />
      <Route
        path="/clients/:clientId/shortlist"
        element={
          <RequireContext>
            <ShortlistPage />
          </RequireContext>
        }
      />
      <Route
        path="/clients/:clientId/items/:id"
        element={
          <RequireContext>
            <DetailPage />
          </RequireContext>
        }
      />
      <Route path="/catalog" element={<Navigate to="/" replace />} />
      <Route path="/shortlist" element={<Navigate to="/" replace />} />
      <Route path="/items/:id" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
