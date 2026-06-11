import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import DashboardPage from './pages/DashboardPage';
import ParentsGuidePage from './pages/ParentsGuidePage';

import LandingPage from './pages/LandingPage';

import './index.css';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/parents" element={<ParentsGuidePage />} />

       

        <Route path="/reading" element={<ReadingPage />} />
      </Routes>
    </BrowserRouter>
  );

}



