import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import PageEditor from './admin/PageEditor';
import AdminSettings from './admin/AdminSettings';
import AdminProducts from './admin/AdminProducts';
import AdminRoute from './admin/AdminRoute';

function App() {
    return (
        <AuthProvider>
            <Routes>
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/pages/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/pages/:pageId" element={<AdminRoute><PageEditor /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />

                {/* Public Routes */}
                <Route path="/*" element={
                    <div className="wrapper">
                        <Navbar />
                        <ScrollToTop />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about-us" element={<About />} />
                            <Route path="/our-services" element={<Services />} />
                            <Route path="/our-products" element={<Products />} />
                            <Route path="/product/:slug" element={<ProductDetail />} />
                            <Route path="/contact-us" element={<Contact />} />
                        </Routes>
                        <Footer />
                    </div>
                } />
            </Routes>
        </AuthProvider>
    );
}

export default App;
