import { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import Landing from "@/pages/Landing";
import CarsForSale from "@/pages/CarsForSale";
import ListingDetail from "@/pages/ListingDetail";
import IncomingCars from "@/pages/IncomingCars";
import IncomingCarDetail from "@/pages/IncomingCarDetail";
import NotFound from "@/pages/not-found";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Admin = lazy(() => import("@/pages/Admin"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const CarDetail = lazy(() => import("@/pages/CarDetail"));
const AddListing = lazy(() => import("@/pages/AddListing"));
const MyCars = lazy(() => import("@/pages/MyCars"));

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/cars-for-sale" component={CarsForSale} />
        <Route path="/listing/:id" component={ListingDetail} />
        <Route path="/incoming-cars" component={IncomingCars} />
        <Route path="/incoming-cars/:id" component={IncomingCarDetail} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/my-cars" component={MyCars} />
        <Route path="/car/:id" component={CarDetail} />
        <Route path="/add-listing" component={AddListing} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
