import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail } from 'lucide-react'; // Optional: you can use different icons

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  return (
    <>
      <footer className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <img
                src="https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg"
                alt="Bank Logo"
                className="h-8 w-8 object-cover rounded-full shadow-md"
              />
              <span className="text-xl font-bold tracking-wider">AC's Bank</span>
            </div>

            <div className="flex flex-col md:flex-row md:space-x-10 space-y-2 md:space-y-0 text-sm">
              <button onClick={() => setActiveModal('terms')} className="hover:text-yellow-300 transition">
                📜 Terms of Service
              </button>
              <button onClick={() => setActiveModal('privacy')} className="hover:text-yellow-300 transition">
                🔐 Privacy Policy
              </button>
              <button onClick={() => setActiveModal('contact')} className="hover:text-yellow-300 transition">
                📞 Contact Us
              </button>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-blue-700 text-center text-sm opacity-80">
            &copy; {new Date().getFullYear()} AC's Bank. All rights reserved.
          </div>
        </div>
      </footer>

      {activeModal && (
        <Modal title={getModalTitle(activeModal)} onClose={() => setActiveModal(null)} icon={getModalIcon(activeModal)}>
          {getModalContent(activeModal)}
        </Modal>
      )}
    </>
  );
};

interface ModalProps {
  title: string;
  icon: JSX.Element;
  children: React.ReactNode;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, icon, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-[90%] max-w-lg relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold"
        >
          ×
        </button>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-full text-blue-700 mr-3">{icon}</div>
          <h2 className="text-lg font-bold text-blue-900">{title}</h2>
        </div>
        <div className="text-gray-700 text-sm">{children}</div>
      </div>
    </div>
  );
};

// Icon helpers
const getModalIcon = (type: 'terms' | 'privacy' | 'contact') => {
  switch (type) {
    case 'terms':
      return <ShieldCheck className="h-5 w-5" />;
    case 'privacy':
      return <Lock className="h-5 w-5" />;
    case 'contact':
      return <Mail className="h-5 w-5" />;
    default:
      return null;
  }
};

const getModalTitle = (type: 'terms' | 'privacy' | 'contact') => {
  switch (type) {
    case 'terms':
      return 'Terms of Service';
    case 'privacy':
      return 'Privacy Policy';
    case 'contact':
      return 'Contact Us';
    default:
      return '';
  }
};

const getModalContent = (type: 'terms' | 'privacy' | 'contact') => {
  switch (type) {
    case 'terms':
      return (
        <>
          <p>
            Welcome to AC’s Bank! By accessing or using our services, you agree to be bound by our terms of use.
            This includes responsible account behavior, no misuse of the platform, and adherence to applicable laws.
          </p>
          <ul className="list-disc list-inside mt-3">
            <li>Don't share your credentials.</li>
            <li>Don't exploit the system or users.</li>
            <li>We reserve the right to suspend accounts in violation.</li>
          </ul>
        </>
      );
    case 'privacy':
      return (
        <>
          <p>
            Your privacy matters. We ensure your data is encrypted and only accessible by authorized personnel.
            We do not sell or share your information with third parties.
          </p>
          <ul className="list-disc list-inside mt-3">
            <li>We store your data securely.</li>
            <li>We only use data to enhance your experience.</li>
            <li>Contact support for data deletion requests.</li>
          </ul>
        </>
      );
    case 'contact':
      return (
        <div className="space-y-2">
          <p><strong>👤 Name:</strong> Anand Tripathi</p>
          <p><strong>✉️ Email:</strong> anand.t9903@gmail.com</p>
          <p><strong>📞 Phone:</strong> 9269021678</p>
          <p><strong>📍 Address:</strong> A-143 Aashiyaana, near SKIT Gate 1, Jagatpura, Jaipur</p>
          
          

        </div>
      );
    default:
      return null;
  }
};

export default Footer;
