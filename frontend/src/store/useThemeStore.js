import { create } from 'zustand';

const useThemeStore = create((set) => ({
    theme: localStorage.getItem("Talkie-theme")||"coffee",
    setTheme: (theme) => {
        localStorage.setItem("Talkie-theme", theme);
        set({ theme });
    },
}));

export { useThemeStore };