import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import MyPayments from "@/pages/my-payments";
import Yield from "@/pages/yield";
import Documentation from "@/pages/documentation";
import LiquidityPoolDemo from "@/pages/liquidity-pool-demo";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-payments" component={MyPayments} />
      <Route path="/yield" component={Yield} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/liquidity-pool-demo" component={LiquidityPoolDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
