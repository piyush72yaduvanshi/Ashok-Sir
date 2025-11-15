import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./component/NavBar";
import FranchiseRegister from "./pages/CreateFranchise";
import ProfilePage from "./pages/ProfilePage";
import FoodBillingPOS from "./pages/FooodPage";
import BillManagementPage from "./pages/ViewBill";
import DragUpload from "./config/Upload";

const Dashboard = () => (
  <div className="h-screen flex items-center justify-center text-3xl font-bold text-indigo-600">
    🎉 Welcome to Dashboard!
  </div>
);
const VerifyPage = () => (
  <div className="h-screen flex items-center justify-center text-2xl font-semibold text-green-600">
    ✅ Verification Page — Coming Soon
  </div>
);
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
    <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/upload" element={<DragUpload />} />
        <Route path="/bill" element={<BillManagementPage />} />
        <Route path="/food" element={<FoodBillingPOS />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create-franchise" element={<FranchiseRegister />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
