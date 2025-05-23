import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router';
import { Route, Routes } from 'react-router';
import Acceuil from './Acceuil/Acceuil.tsx';
import { UserProvider } from './Context/UserContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/Acceuil" element={<Acceuil />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </UserProvider>
  </StrictMode>
);
