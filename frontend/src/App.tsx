import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./views/NotFound";
import Home from "./views/Home";
import ListView from "./views/ListView";
import CategoriesView from "./views/CategoriesView";
import SettingsView from "./views/SettingsView";
import BookmarkDetailView from "./views/BookmarkDetailView";
import TagsView from "./views/TagsView";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/list" component={ListView} />
      <Route path="/categories" component={CategoriesView} />
      <Route path="/tags" component={TagsView} />
      <Route path="/settings" component={SettingsView} />
      <Route path="/bookmarks/:id" component={BookmarkDetailView} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App; 