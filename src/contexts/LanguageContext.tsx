import React, { createContext, useContext, useState } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  te: {
    // Navigation
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.employees': 'ఉద్యోగులు',
    'nav.records': 'రికార్డులు',
    'nav.reports': 'రిపోర్టులు',
    'nav.logout': 'లాగౌట్',
    
    // Dashboard
    'dashboard.title': 'వేతన నిర్వహణ డాష్‌బోర్డ్',
    'dashboard.totalEmployees': 'మొత్తం ఉద్యోగులు',
    'dashboard.activeEmployees': 'సక్రియ ఉద్యోగులు',
    'dashboard.totalEarnings': 'మొత్తం మచ్చర్లు',
    'dashboard.totalExpenses': 'మొత్తం కర్చులు',
    'dashboard.quickAdd': 'త్వరిత ఎంట్రీ',
    
    // Employee Management
    'employees.title': 'ఉద్యోగుల నిర్వహణ',
    'employees.addNew': 'కొత్త ఉద్యోగి చేర్చండి',
    'employees.name': 'పేరు',
    'employees.id': 'ఉద్యోగి ID',
    'employees.contact': 'ఫోన్ నంబర్',
    'employees.status': 'స్థితి',
    'employees.actions': 'చర్యలు',
    'employees.active': 'సక్రియం',
    'employees.inactive': 'నిష్క్రియం',
    'employees.edit': 'మార్చు',
    'employees.deactivate': 'నిష్క్రియం చేయి',
    'employees.activate': 'సక్రియం చేయి',
    
    // Daily Records
    'records.title': 'రోజువారీ రికార్డులు',
    'records.addEntry': 'ఎంట్రీ చేర్చండి',
    'records.date': 'తేదీ',
    'records.macharlu': 'మచ్చర్లు',
    'records.karchulu': 'కర్చులు',
    'records.notes': 'గమనికలు',
    'records.save': 'సేవ్ చేయండి',
    'records.cancel': 'రద్దు చేయండి',
    
    // Reports
    'reports.title': 'రిపోర్టులు',
    'reports.generate': 'రిపోర్ట్ తయారు చేయండి',
    'reports.download': 'డౌన్‌లోడ్ చేయండి',
    'reports.fromDate': 'మొదటి తేదీ',
    'reports.toDate': 'చివరి తేదీ',
    'reports.allEmployees': 'అన్ని ఉద్యోగులు',
    
    // Common
    'common.search': 'వెతకండి',
    'common.filter': 'ఫిల్టర్',
    'common.total': 'మొత్తం',
    'common.balance': 'బ్యాలెన్స్',
    'common.submit': 'సమర్పించండి',
    'common.close': 'మూసివేయండి',
    'common.confirm': 'నిర్ధారించండి',
    'common.success': 'విజయవంతం',
    'common.error': 'లోపం',
    
    // Login
    'login.title': 'లాగిన్',
    'login.username': 'యూజర్‌నేమ్',
    'login.password': 'పాస్‌వర్డ్',
    'login.submit': 'లాగిన్',
    'login.welcome': 'వేతన నిర్వహణ వ్యవస్థకు స్వాగతం',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.employees': 'Employees',
    'nav.records': 'Records',
    'nav.reports': 'Reports',
    'nav.logout': 'Logout',
    
    // Dashboard
    'dashboard.title': 'Wage Management Dashboard',
    'dashboard.totalEmployees': 'Total Employees',
    'dashboard.activeEmployees': 'Active Employees',
    'dashboard.totalEarnings': 'Total Earnings',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.quickAdd': 'Quick Entry',
    
    // Employee Management
    'employees.title': 'Employee Management',
    'employees.addNew': 'Add New Employee',
    'employees.name': 'Name',
    'employees.id': 'Employee ID',
    'employees.contact': 'Phone Number',
    'employees.status': 'Status',
    'employees.actions': 'Actions',
    'employees.active': 'Active',
    'employees.inactive': 'Inactive',
    'employees.edit': 'Edit',
    'employees.deactivate': 'Deactivate',
    'employees.activate': 'Activate',
    
    // Daily Records
    'records.title': 'Daily Records',
    'records.addEntry': 'Add Entry',
    'records.date': 'Date',
    'records.macharlu': 'Earnings',
    'records.karchulu': 'Expenses',
    'records.notes': 'Notes',
    'records.save': 'Save',
    'records.cancel': 'Cancel',
    
    // Reports
    'reports.title': 'Reports',
    'reports.generate': 'Generate Report',
    'reports.download': 'Download',
    'reports.fromDate': 'From Date',
    'reports.toDate': 'To Date',
    'reports.allEmployees': 'All Employees',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.total': 'Total',
    'common.balance': 'Balance',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.success': 'Success',
    'common.error': 'Error',
    
    // Login
    'login.title': 'Login',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.submit': 'Login',
    'login.welcome': 'Welcome to Wage Management System',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('te');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}