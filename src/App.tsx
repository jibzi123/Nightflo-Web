import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import EventsManager from './components/Events/EventsManager';
import StaffManager from './components/Staff/StaffManager';
import CustomerManager from './components/Customers/CustomerManager';
import FinancialManager from './components/Financial/FinancialManager';
import PromoterManager from './components/Promoters/PromoterManager';
import UserManager from './components/Users/UserManager';
import QRScanner from './components/QRScan/QRScanner';
import ClubManager from './components/Clubs/ClubManager';
import ClubSettings from './components/Settings/ClubSettings';
import RefundsManager from './components/Refunds/RefundsManager';
import ReviewsManager from './components/Reviews/ReviewsManager';
import BookingsManager from './components/Bookings/BookingsManager';
import EventCreator from './components/Events/EventCreator';
import ComplianceManager from './components/Compliance/ComplianceManager';
import SubscriptionManager from './components/Subscriptions/SubscriptionManager';
import PackageManager from './components/Packages/PackageManager';
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/events.css';
import './styles/dashboard.css';

const App: React.FC = () => {
  const AuthDependentContent: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const [activeModule, setActiveModule] = useState('dashboard');
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [pastEvents, setPastEvents] = useState<any[]>([]);

    const handleEventUpdated = (updatedEvent: any) => {
      setUpcomingEvents(prev =>
        prev.map(ev => ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev)
      );
      setPastEvents(prev =>
        prev.map(ev => ev.id === updatedEvent.id ? { ...ev, ...updatedEvent } : ev)
      );
    };



    if (!isAuthenticated) {
      return <LoginForm />;
    }

    const getModuleTitle = (module: string): string => {
      const titles: Record<string, string> = {
        dashboard: 'Dashboard',
        events: 'Events Management',
        bookings: 'Bookings Management',
        clubs: 'Club Management',
        staff: 'Staff Management',
        customers: 'Customer Management',
        financial: 'Financial Management',
        promoters: 'Promoter Network',
        users: 'User Management',
        'qr-scan': 'QR Scanner',
        settings: 'Club Settings',
        refunds: 'Refunds Management',
        reviews: 'Customer Reviews',
        'create-event': 'Create Event',
        compliance: 'Compliance Management',
        subscriptions: 'Subscription Management',
      };
      return titles[module] || 'Dashboard';
    };

    const renderModule = () => {
      switch (activeModule) {
        case 'dashboard':
          return <Dashboard />;
        case "events":
          return (
            <EventsManager
              onModuleChange={setActiveModule}
              onEditEvent={(event) => {
                setSelectedEvent(event);
                setActiveModule("edit-event");
              }}
              upcomingEvents={upcomingEvents}
              pastEvents={pastEvents}
            />
          );


        case 'bookings':
          return <BookingsManager />;
        case "create-event":
          return (
            <EventCreator 
              mode="create" 
              onEventCreated={() => setActiveModule("events")} 
            />
          );

        case "edit-event":
          return (
            <EventCreator
              mode="edit"
              eventData={selectedEvent}
              onEventUpdated={(updatedEvent) => {
                handleEventUpdated(updatedEvent);   // update state here
                setActiveModule("events");          // go back to list
              }}
            />
          );




        case 'clubs':
          return user?.userType === 'super_admin' ? <ClubManager /> : <Dashboard />;
        case 'staff':
          return <StaffManager />;
        case 'customers':
          return <CustomerManager />;
        case 'financial':
          return <FinancialManager />;
        case 'promoters':
          return <PromoterManager />;
        case 'users':
          return user?.userType === 'super_admin' ? <UserManager /> : <Dashboard />;
        case 'qr-scan':
          return <QRScanner />;
        case 'settings':
          return user?.userType === 'CLUB_OWNER' ? <ClubSettings /> : <Dashboard />;
        case 'refunds':
          return user?.userType === 'CLUB_OWNER' || user?.userType === 'super_admin' ? <RefundsManager /> : <Dashboard />;
        case 'reviews':
          return user?.userType === 'CLUB_OWNER' || user?.userType === 'super_admin' ? <ReviewsManager /> : <Dashboard />;
        case 'compliance':
          return user?.userType === 'super_admin' ? <ComplianceManager /> : <Dashboard />;
        case 'subscriptions':
          return user?.userType === 'super_admin' ? <SubscriptionManager /> : <Dashboard />;
        case 'packages':
          return user?.userType === 'super_admin' ? <PackageManager /> : <Dashboard />;
        default:
          return <Dashboard />;
      }
    };

    return (
      <Layout
        title={getModuleTitle(activeModule)}
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      >
        {renderModule()}
      </Layout>
    );
  };

  return (
    <AuthProvider>
      <AuthDependentContent />
    </AuthProvider>
  );
};

export default App;