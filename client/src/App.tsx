import { Switch, Route, Link } from "wouter";
import NotFound from "@/pages/not-found";
import PokerTable from "@/pages/PokerTable";
import TableDesign from "@/pages/TableDesign";
import { PokerTableProvider } from "./context/PokerTableContext";
import { ThemeProvider } from "next-themes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PokerTable} />
      <Route path="/design" component={TableDesign} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <PokerTableProvider>
        <nav className="fixed top-2 right-2 z-50 bg-white dark:bg-gray-800 shadow rounded-lg p-2">
          <div className="flex space-x-2">
            <Link href="/">
              <div className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-md cursor-pointer">
                App
              </div>
            </Link>
            <Link href="/design">
              <div className="px-3 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:hover:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-md cursor-pointer">
                Design
              </div>
            </Link>
          </div>
        </nav>
        <Router />
      </PokerTableProvider>
    </ThemeProvider>
  );
}

export default App;
