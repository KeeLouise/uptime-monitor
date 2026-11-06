import { Route, Routes } from "react-router";
import Dashboard from "./pages/Dashboard.jsx";
import SiteDetail from "./pages/SiteDetail.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/sites/:id" element={<SiteDetail />} />
    </Routes>
  );
}

export default App;
