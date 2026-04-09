import type { Component } from 'solid-js';
import { Router, Route } from '@solidjs/router';
import Home from './pages/Home';
import ServiceDetail from './pages/ServiceDetail';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import AdminLogin from './pages/admin/AdminLogin';
import AdminHome from './pages/admin/AdminHome';
import AdminGuard from './components/AdminGuard';

// Peta route utama frontend.
// Di sini terlihat hubungan halaman publik dan area admin yang diproteksi.
const App: Component = () => {
  return (
    <Router>
      {/* Route publik untuk pengunjung website */}
      {/* Beranda: menampilkan highlight layanan, teaser portfolio, testimoni, dan CTA. */}
      <Route path="/" component={Home} />
      {/* Detail layanan: slug menentukan kategori paket yang ditampilkan. */}
      <Route path="/pricelist/:slug" component={ServiceDetail} />
      {/* Portfolio: galeri dengan tab kategori yang dikelola dari backend/admin. */}
      <Route path="/portfolio" component={Portfolio} />
      {/* Tentang: halaman profil yang teks/gambarnya bisa diedit lewat admin. */}
      <Route path="/about" component={About} />
      
      {/* Route area admin */}
      {/* Halaman login admin */}
      <Route path="/admin" component={AdminLogin} />
      {/* Dashboard admin diproteksi guard: wajib login dulu sebelum masuk. */}
      <Route path="/admin/home" component={() => (
        <AdminGuard>
          <AdminHome />
        </AdminGuard>
      )} />
    </Router>
  );
};

export default App;
