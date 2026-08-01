import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReadingPage from './pages/ReadingPage';
import DashboardPage from './pages/DashboardPage';
import ParentsGuidePage from './pages/ParentsGuidePage';
import LoginPage from './pages/LoginPage';
import LandingPage from './pages/LandingPage';
import BornoBazar from './features/BornoBazar/BornoBazar';
import TeacherWorkspacePage from './pages/TeacherWorkspacePage';
import { ClassroomProvider } from './context/ClassroomContext';
import ClassroomHUD from './components/ClassroomHUD';

import './index.css';


export default function App() {
  return (
    <ClassroomProvider>
      <BrowserRouter>
        <ClassroomHUD />
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/teacher-workspace" element={<TeacherWorkspacePage />} />
          <Route path="/teacher" element={<TeacherWorkspacePage />} />
          <Route path="/parents" element={<ParentsGuidePage />} />
          <Route path="/reading" element={<ReadingPage />} />
          <Route path="/borno-bazar" element={<BornoBazar />} />
        </Routes>
      </BrowserRouter>
    </ClassroomProvider>
  );

}



