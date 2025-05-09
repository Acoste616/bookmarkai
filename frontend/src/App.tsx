import React from 'react';
import { Route, Switch } from 'wouter';
import { ListView } from './views/ListView';
import { NetworkGraphView } from './views/NetworkGraphView';
import { ToastContainer } from './components/Toast';
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./views/NotFound";
import Home from "./views/Home";
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
      <Route path="/network" component={NetworkGraphView} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-[#0a0a25] text-white">
        <Router />
        <Toaster />
        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}

export default App; 