import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import ClinicalCases from "./pages/ClinicalCases";
import ExpertProfile from "./pages/ExpertProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SchoolClinicalCases from "./pages/SchoolClinicalCases";
import CreateSchoolCase from "./pages/CreateSchoolCase";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main Routes - With Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cases" element={<ClinicalCases />} />
                <Route path="/cas-ecole" element={<SchoolClinicalCases />} />
                <Route path="/cas-ecole/create" element={<CreateSchoolCase />} />
                <Route path="/profile" element={<ExpertProfile />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
