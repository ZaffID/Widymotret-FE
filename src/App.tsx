import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminHome from './pages/admin/AdminHome';
import AdminGuard from './components/AdminGuard';

const App: Component = () => {
  return (
    <Router>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/pricelist/:slug" component={ServiceDetail} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/home" component={() => (
        <AdminGuard>
          <AdminHome />
        </AdminGuard>
      )} />
    </Router>
  );
};

export default App;
