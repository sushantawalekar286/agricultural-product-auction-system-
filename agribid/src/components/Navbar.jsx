import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Gavel, LayoutDashboard, Languages } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language && i18n.language.startsWith('en') ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Gavel size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-800">AgriBid <span className="text-emerald-600">Pro+</span></span>
        </Link>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-stone-600 hover:text-emerald-600 transition-colors font-medium text-sm"
          >
            <Languages size={18} />
            {i18n.language && i18n.language.startsWith('en') ? 'मराठी' : 'English'}
          </button>

          {user ? (
            <>
              <Link 
                to={`/${user.role}`}
                className="flex items-center gap-2 text-stone-600 hover:text-emerald-600 transition-colors font-medium text-sm"
              >
                <LayoutDashboard size={18} />
                {t('dashboard')}
              </Link>
              <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-stone-800">{user.name}</span>
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">{t(user.role)}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-stone-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-stone-600 hover:text-emerald-600 px-4 py-2">{t('login')}</Link>
              <Link to="/register" className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2 rounded-xl shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all">{t('register')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
