import { createContext, startTransition, useContext, useEffect, useState } from "react";
import api from "../../core/api/axios";

const LayoutDataContext = createContext(null);

const initialData = {
  dashboard: null,
  medicines: [],
  sales: [],
  purchases: [],
  customers: [],
  suppliers: [],
  alerts: null,
  reports: null,
  patients: [],
  appointments: [],
  prescriptions: [],
  settings: null,
};

const requests = [
  ["dashboard", "/dashboard/summary"],
  ["medicines", "/medicines"],
  ["sales", "/billing/sales"],
  ["purchases", "/purchases"],
  ["customers", "/people/customers"],
  ["suppliers", "/people/suppliers"],
  ["alerts", "/alerts"],
  ["reports", "/reports"],
  ["patients", "/clinic/patients"],
  ["appointments", "/clinic/appointments"],
  ["prescriptions", "/clinic/prescriptions"],
  ["settings", "/settings"],
];

export const LayoutDataProvider = ({ children }) => {
  const [shellData, setShellData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const refreshShellData = async () => {
    setLoading(true);

    const results = await Promise.allSettled(
      requests.map(([, url]) => api.get(url))
    );

    const nextData = {};
    const nextErrors = {};

    results.forEach((result, index) => {
      const [key] = requests[index];
      if (result.status === "fulfilled") {
        nextData[key] = result.value.data;
        nextErrors[key] = "";
      } else {
        nextErrors[key] =
          result.reason?.response?.data?.message ||
          result.reason?.message ||
          "Unable to load data.";
      }
    });

    startTransition(() => {
      setShellData((current) => ({ ...current, ...nextData }));
      setErrors(nextErrors);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshShellData();
  }, []);

  return (
    <LayoutDataContext.Provider
      value={{
        shellData,
        loading,
        errors,
        refreshShellData,
      }}
    >
      {children}
    </LayoutDataContext.Provider>
  );
};

export const useLayoutData = () => useContext(LayoutDataContext);
