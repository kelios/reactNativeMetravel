import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Filters, FiltersContextType } from '@/src/types/types';

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const useFilters = () => {
    const context = useContext(FiltersContext);
    if (context === undefined) {
        throw new Error('useFilters must be used within a FiltersProvider');
    }
    return context;
};

interface FiltersProviderProps {
    children: ReactNode;
}

export const FiltersProvider: React.FC<FiltersProviderProps> = ({ children }) => {
    // Хук useState вызываем на верхнем уровне компонента
    const [filters, setFilters] = useState<Filters>({
        countries: [],
        categories: [],
        categoryTravelAddress: [],
        companions: [],
        complexity: [],
        month: [],
        overNightStay: [],
        transports: [],
        year: ''
    });

    const updateFilters = (newFilters: Partial<Filters>) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
    };

    return (
        <FiltersContext.Provider value={{ filters, updateFilters }}>
            {children}
        </FiltersContext.Provider>
    );
};
