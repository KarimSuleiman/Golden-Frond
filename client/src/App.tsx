import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import CarDetail from "@/pages/CarDetail";
import CarsForSale from "@/pages/CarsForSale";
import ListingDetail from "@/pages/ListingDetail";
import AddListing from "@/pages/AddListing";
import MyCars from "@/pages/MyCars";
import IncomingCars from "@/pages/IncomingCars";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/my-cars" component={MyCars} />
      <Route path="/car/:id" component={CarDetail} />
      <Route path="/cars-for-sale" component={CarsForSale} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/add-listing" component={AddListing} />
      <Route path="/incoming-cars" component={IncomingCars} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
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
