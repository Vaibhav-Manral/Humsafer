import React, { createContext, useCallback, useEffect, useState } from 'react';
import { ICompany } from '../models/Companies';

export interface ICompanyData {
  selectedCompany?: ICompany;
  selectCompany: (company: ICompany) => void;
  clearCompanySelection: () => void;
}

const selectedCompanyKey = "selectedCompanyKey";

export const CompanyDataContext = createContext<ICompanyData>(undefined!);

function getInitialState() {
  const companyDataAndCapabilites = localStorage.getItem(selectedCompanyKey);
  if (companyDataAndCapabilites) {
    return JSON.parse(companyDataAndCapabilites) as ICompany;
  }
}

export const CompanyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCompany, setSelectedCompany] = useState<ICompany | undefined>(getInitialState());

  useEffect(() => {
    if (selectedCompany) {
      localStorage.setItem(selectedCompanyKey, JSON.stringify(selectedCompany));
    }
  }, [selectedCompany])


  const selectCompany = useCallback(
    (selectedCompany: ICompany) => {
      setSelectedCompany(selectedCompany);
    }, []);

  const clearCompanySelection = useCallback(() => {
    setSelectedCompany(undefined);
    localStorage.removeItem(selectedCompanyKey);
  }, [setSelectedCompany]);

  return (
    <CompanyDataContext.Provider
      value={{
        selectedCompany,
        selectCompany,
        clearCompanySelection,
      }}
    >
      {children}
    </CompanyDataContext.Provider>
  );
};
