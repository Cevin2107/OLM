import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AuthorsSection } from './components/AuthorsSection';
import { WorksSection } from './components/WorksSection';
import { TimelineSection } from './components/TimelineSection';
import { LiteraryTheorySection } from './components/LiteraryTheorySection';
import { CommentsSection } from './components/CommentsSection';
import { GoogleEarthSection } from './components/GoogleEarthSection';
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
          ? 'bg-[#1a4f99] hover:bg-[#143d7a] text-white rotate-0'
          : 'bg-[#3b82c4] hover:bg-[#2d6db5] text-[#1a1a1a]'
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
        <LiteraryTheorySection />
        <GoogleEarthSection />
        <CommentsSection />
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
