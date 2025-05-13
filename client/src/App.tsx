import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import PokerTable from "@/pages/PokerTable";
import { PokerTableProvider } from "./context/PokerTableContext";

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
    <PokerTableProvider>
      <Router />
    </PokerTableProvider>
  );
}

export default App;
