import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import DashboardPage from './pages/DashboardPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/reading" element={<ReadingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
