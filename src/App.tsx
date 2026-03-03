import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AuthorsSection } from './components/AuthorsSection';
import { WorksSection } from './components/WorksSection';
import { TimelineSection } from './components/TimelineSection';
import { Footer } from './components/Footer';
import { EditProvider, useEditMode } from './context/EditContext';
import { Pencil, X } from 'lucide-react';

function EditToggleButton() {
  const { isEditMode, toggleEditMode } = useEditMode();
  return (
    <button
      onClick={toggleEditMode}
      title={isEditMode ? 'Thoát chế độ chỉnh sửa' : 'Chế độ chỉnh sửa'}
      className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
        isEditMode
          ? 'bg-[#8b2500] hover:bg-[#6b1a00] text-white rotate-0'
          : 'bg-[#c89b3c] hover:bg-[#a07830] text-[#1a1a1a]'
      }`}
    >
      {isEditMode ? <X size={22} /> : <Pencil size={20} />}
    </button>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AuthorsSection />
        <WorksSection />
        <TimelineSection />
      </main>
      <Footer />
      <EditToggleButton />
    </div>
  );
}

function App() {
  return (
    <EditProvider>
      <AppContent />
    </EditProvider>
  );
}

export default App;
