import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/views/DashboardView';
import StudentsView from './components/views/StudentsView';
import StudentProfileView from './components/views/StudentProfileView';
import StaffView from './components/views/TrainersView';
import StaffProfileView from './components/views/TrainerProfileView';
import CoursesView from './components/views/CoursesView';
import FeesView from './components/views/FeesView';
import ExpensesView from './components/views/ExpensesView';
import AssignmentsView from './components/views/AssignmentsView';
import LeadsView from './components/views/LeadsView';
import BatchesView from './components/views/BatchesView';
import { useMockData } from './hooks/useMockData';

// All possible sidebar views
export type ViewType =
  | 'dashboard'
  | 'students'
  | 'staff'
  | 'courses'
  | 'batches'
  | 'fees'
  | 'expenses'
  | 'assignments'
  | 'leads';

const App: React.FC = () => {
  // --- State Management ---
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const mockData = useMockData();

  // --- Theme Persistence ---
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Handlers ---
  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleViewStudentProfile = (studentId: string) => {
    setSelectedStudentId(studentId);
    setSelectedStaffId(null);
  };

  const handleViewStaffProfile = (staffId: string) => {
    setSelectedStaffId(staffId);
    setSelectedStudentId(null);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    setSelectedStaffId(null);
  };

  const handleSidebarNavigation = (view: ViewType) => {
    setActiveView(view);
    setSelectedStudentId(null);
    setSelectedStaffId(null);
  };

  // --- Conditional View Rendering ---
  const renderView = () => {
    if (selectedStudentId) {
      return (
        <StudentProfileView
          studentId={selectedStudentId}
          data={mockData}
          onBack={handleBackToList}
        />
      );
    }

    if (selectedStaffId) {
      return (
        <StaffProfileView
          staffId={selectedStaffId}
          data={mockData}
          onBack={handleBackToList}
        />
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView data={mockData} />;
      case 'students':
        return <StudentsView data={mockData} onViewProfile={handleViewStudentProfile} />;
      case 'staff':
        return <StaffView data={mockData} onViewProfile={handleViewStaffProfile} />;
      case 'courses':
        return <CoursesView data={mockData} />;
      case 'batches':
        return <BatchesView data={mockData} />;
      case 'fees':
        return <FeesView data={mockData} />;
      case 'expenses':
        return <ExpensesView data={mockData} />;
      case 'assignments':
        return <AssignmentsView data={mockData} />;
      case 'leads':
        return <LeadsView data={mockData} />;
      default:
        return <DashboardView data={mockData} />;
    }
  };

  // --- Render ---
  return (
    <div className="d-flex vh-100 bg-body-tertiary">
      <Sidebar
        activeView={activeView}
        setActiveView={handleSidebarNavigation}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="flex-grow-1 p-4 p-md-5 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default App;