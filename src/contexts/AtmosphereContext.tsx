import React, { createContext, useContext, useEffect, useState } from 'react';

export type AtmosphereType = 'none' | 'rain' | 'snow' | 'aurora' | 'wind' | 'cyberstorm' | 'solarflare' | 'sandstorm' | 'stardust' | 'ocean';

interface AtmosphereContextType {
    atmosphere: AtmosphereType;
    setAtmosphere: (type: AtmosphereType) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType | undefined>(undefined);

export const AtmosphereProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [atmosphere, setAtmosphereState] = useState<AtmosphereType>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('atmosphere') as AtmosphereType) || 'none';
        }
        return 'none';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove all previous atmosphere classes
        const classes = Array.from(root.classList).filter(c => c.startsWith('atmosphere-'));
        root.classList.remove(...classes);

        if (atmosphere !== 'none') {
            root.classList.add(`atmosphere-${atmosphere}`);
        }
    }, [atmosphere]);

    const setAtmosphere = (type: AtmosphereType) => {
        setAtmosphereState(type);
        localStorage.setItem('atmosphere', type);
    };

    return (
        <AtmosphereContext.Provider value={{ atmosphere, setAtmosphere }}>
            {children}
        </AtmosphereContext.Provider>
    );
};

export const useAtmosphere = () => {
    const context = useContext(AtmosphereContext);
    if (!context) {
        throw new Error('useAtmosphere must be used within an AtmosphereProvider');
    }
    return context;
};
