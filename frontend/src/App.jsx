import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ThemeProvider from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PackageDetails from "./pages/PackageDetails";
import VerifyPayment from "./pages/VerifyPayment";
import Receipt from "./pages/Receipt";
import MyBookings from "./pages/MyBookings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/package/:id" element={<PackageDetails />} />
          <Route path="/verify-payment" element={<VerifyPayment />} />
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
