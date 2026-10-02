import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AgencyPage } from "./pages/AgencyPage";
import { PortalHome } from "./pages/PortalHome";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ClientHome() {
  const { clientId } = useParams();
  return <Navigate to={clientId ? `/clients/${clientId}` : "/"} replace />;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AgencyPage />} />
        <Route path="/clients/:clientId" element={<PortalHome />} />
        <Route path="/clients/:clientId/intake" element={<ClientHome />} />
        <Route path="/clients/:clientId/catalog" element={<ClientHome />} />
        <Route path="/clients/:clientId/shortlist" element={<ClientHome />} />
        <Route path="/clients/:clientId/items/:id" element={<ClientHome />} />
        <Route path="/catalog" element={<Navigate to="/" replace />} />
        <Route path="/shortlist" element={<Navigate to="/" replace />} />
        <Route path="/items/:id" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
