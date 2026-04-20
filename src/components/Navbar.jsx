import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { LogOut, Gavel, LayoutDashboard, Languages, Bell, CheckCheck, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setToasts([]);
      setIsNotificationOpen(false);
      return;
    }

    const loadNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (notification) => {
      setNotifications((current) => {
        const exists = current.some((item) => item._id === notification._id);
        if (exists) return current;
        return [notification, ...current].slice(0, 50);
      });

      setToasts((current) => [
        {
          id: `${Date.now()}-${Math.random()}`,
          message: notification.message,
          type: notification.type || 'general'
        },
        ...current
      ].slice(0, 3));
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  useEffect(() => {
    if (!toasts.length) return;

    const timer = setTimeout(() => {
      setToasts((current) => current.slice(0, -1));
    }, 3500);

    return () => clearTimeout(timer);
  }, [toasts]);

  const toggleLanguage = () => {
    const newLang = i18n.language && i18n.language.startsWith('en') ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (notificationId) => {
    try {
      const { data } = await api.put(`/notifications/${notificationId}/read`);
      setNotifications((current) => current.map((notification) => (
        notification._id === notificationId ? data : notification
      )));
    } catch (error) {
      console.error('Failed to update notification:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notification) => !notification.isRead);
    await Promise.all(unreadNotifications.map((notification) => markAsRead(notification._id)));
  };

  return (
    <>
      <div className="fixed top-4 right-4 z-[70] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto min-w-[280px] max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl shadow-stone-300/30 px-4 py-3 flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-800">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
              className="text-stone-400 hover:text-stone-700"
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

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
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen((current) => !current)}
                  className="relative p-2 rounded-xl text-stone-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl border border-stone-200 shadow-2xl shadow-stone-300/30 overflow-hidden">
                    <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-stone-800">Notifications</p>
                        <p className="text-xs text-stone-400">Live auction updates and results</p>
                      </div>
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => markAsRead(notification._id)}
                          className={`w-full text-left px-5 py-4 border-b border-stone-50 hover:bg-stone-50 transition-colors ${notification.isRead ? 'bg-white' : 'bg-emerald-50/40'}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${notification.isRead ? 'bg-stone-300' : 'bg-emerald-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-stone-800">{notification.message}</p>
                              <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </button>
                      )) : (
                        <div className="px-5 py-8 text-center text-stone-400 text-sm">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

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
    </>
  );
};

export default Navbar;
