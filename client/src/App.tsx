import { lazy, Suspense, Component, ReactNode, ErrorInfo } from "react";
import { Switch, Route } from "wouter";
import { Loader2 } from "lucide-react";
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

interface ErrorBoundaryState { error: Error | null; }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[App ErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600">حدث خطأ غير متوقع</h1>
          <p className="text-muted-foreground text-sm max-w-md break-all">{this.state.error.message}</p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
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
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
