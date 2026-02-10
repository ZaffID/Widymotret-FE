import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';

const App: Component = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/pricelist/:slug" component={ServiceDetail} />
    </Router>
  );
};

export default App;
