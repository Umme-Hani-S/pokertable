import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import PokerTable from "@/components/PokerTable";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PokerTable} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Router />
    </ThemeProvider>
  );
}

export default App;
