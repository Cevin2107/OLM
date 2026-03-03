import { createContext, useContext, useState, type ReactNode } from 'react';

interface EditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
}

const EditContext = createContext<EditContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
});

export function EditProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const toggleEditMode = () => setIsEditMode((prev) => !prev);

  return (
    <EditContext.Provider value={{ isEditMode, toggleEditMode }}>
      {children}
    </EditContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditContext);
}
