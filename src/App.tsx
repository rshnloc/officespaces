import { useState, useCallback, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import OfficeSpaces from './components/OfficeSpaces';
import About from './components/About';
import Stats from './components/Stats';
import CTABanner from './components/CTABanner';
import Locations from './components/Locations';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ConsultationModal from './components/ConsultationModal';
import AuthModal from './components/AuthModal';
import AdminPortal from './components/AdminPortal';
import { ApiService } from './services/api';
import type { User } from './services/api';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Verify profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      ApiService.getProfile()
        .then((res) => {
          if (res.data) {
            setCurrentUser(res.data);
            localStorage.setItem('auth_user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          setCurrentUser(null);
        });
    }
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    setIsPortalOpen(true);
  };

  const handleLogout = () => {
    ApiService.logout().finally(() => {
      setCurrentUser(null);
      setIsPortalOpen(false);
    });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar
        onBookConsultation={openModal}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPortal={() => setIsPortalOpen(true)}
      />

      {/* Main Content */}
      <main>
        <Hero onBookConsultation={openModal} />
        <Services />
        <OfficeSpaces />
        <About />
        <Stats />
        <CTABanner onBookConsultation={openModal} />
        <Locations />
        <Testimonials />
        <CTASection onBookConsultation={openModal} />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Consultation Modal */}
      <ConsultationModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Auth Modal (Sign In / Register / Demo 1-Click) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Admin / Customer Portal Drawer */}
      <AdminPortal
        isOpen={isPortalOpen}
        user={currentUser}
        onClose={() => setIsPortalOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
