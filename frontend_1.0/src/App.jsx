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
import DashboardPage from "./pages/DashboardPage";
import CreateFoodPage from "./pages/CreateFoodPage";
import SignUpPage from "./pages/SignUpPage";
import VerificationPage from "./pages/Verification";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/create-franchise" element={<FranchiseRegister />} />
        <Route path="/food" element={<FoodBillingPOS />} />
        <Route path="/create-food" element={<CreateFoodPage />} />
        <Route path="/bill" element={<BillManagementPage />} />
        <Route path="/upload" element={<DragUpload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
