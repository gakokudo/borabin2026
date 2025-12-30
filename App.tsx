import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import BingoPage from './pages/BingoPage';
import RegistrationPage from './pages/RegistrationPage';
import AdminPage from './pages/AdminPage';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/create" element={<CreateEventPage />} />
          <Route path="/edit/:id" element={<CreateEventPage />} />
          <Route path="/copy/:id" element={<CreateEventPage />} />
          <Route path="/bingo" element={<BingoPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
