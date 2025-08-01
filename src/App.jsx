import { Toaster } from "./components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { Toaster as Sonner } from "./components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./hooks/useauth";
import { HomePage } from "./pages/HomePage";
import { SignupPage } from "./pages/auth/SignupPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { OTPPage } from "./pages/auth/OTPPage.jsx";
import NotFound from "./pages/NotFound";
import CreatePage from "./pages/auth/CreatePage";
import DetailPage from "./pages/DetailPage";
// import Profile from "./pages/Profile";
import ProfileDetails from "./components/ProfileDetails";
import UpdatePortfolio from "./pages/UpdatePortfolio";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* <AuthProvider> */}
      <TooltipProvider>
        <Toaster />
        {/* <Sonner /> */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-otp" element={<OTPPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/details/:id" element={<DetailPage />} />
            <Route path="/profile" element={<ProfileDetails />} />
            <Route path="/update/:id" element={<UpdatePortfolio />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    {/* </AuthProvider> */}
  </QueryClientProvider>
);

export default App;
