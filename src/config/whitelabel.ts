export interface WhiteLabelConfig {
  institutionName: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  tagline: string;
  features: {
    videoProvider: 'zoom' | 'google-meet' | 'microsoft-teams';
    calendarProvider: 'calendly' | 'google-calendar';
    enableCRM: boolean;
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
}

// Default configuration - can be overridden per institution
export const defaultConfig: WhiteLabelConfig = {
  institutionName: "Quran Academy",
  tagline: "Learn Quran Online with Expert Teachers",
  primaryColor: "160 45% 25%", // Islamic teal
  accentColor: "45 85% 55%", // Golden
  features: {
    videoProvider: 'zoom',
    calendarProvider: 'calendly',
    enableCRM: true,
  },
  contact: {
    email: "info@quranacademy.com",
  },
};

// Function to apply white-label theme
export const applyWhiteLabelTheme = (config: WhiteLabelConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', config.primaryColor);
  root.style.setProperty('--accent', config.accentColor);
  document.title = config.institutionName;
};