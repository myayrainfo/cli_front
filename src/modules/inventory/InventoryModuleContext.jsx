import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createEmptyMedicine,
  createMedicineRecord,
  getDaysUntil,
  getMedicineStatus,
  inventoryAdjustments,
  inventoryMedicines,
  inventoryMovements,
  inventoryReturns,
  inventorySummary,
  stockValueByCategory,
} from "./data/inventoryMockData";

const InventoryModuleContext = createContext(null);

const requiredMedicineFields = [
  "name",
  "category",
  "batchNumber",
  "supplier",
  "quantity",
  "sellingPrice",
  "expiryDate",
];

const formatLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const normalizeValue = (field, value) => {
  const numericFields = ["purchasePrice", "sellingPrice", "mrp", "gst", "discount", "quantity", "minimumStock"];

  if (numericFields.includes(field)) {
    return value === "" ? "" : Number(value);
  }

  return value;
};

const buildMedicinePayload = (draft, existingCount) => {
  const safeName = draft.name?.trim() || "Medicine";
  const compactName = safeName.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const nextCode = draft.code?.trim() || `${compactName.slice(0, 6) || "MED"}${String(existingCount + 1).padStart(3, "0")}`;

  return createMedicineRecord({
    ...draft,
    id: draft.id || `med-${Date.now()}`,
    name: safeName,
    code: nextCode,
    brand: draft.brand?.trim() || draft.company?.trim() || "AYRA Brand",
    company: draft.company?.trim() || draft.brand?.trim() || "AYRA Brand",
    barcode: draft.barcode?.trim() || `${Date.now()}`.slice(-12),
    unitType: draft.unitType?.trim() || "Strip",
    rackLocation: draft.rackLocation?.trim() || "Unassigned",
    notes: draft.notes?.trim() || "",
  });
};

const createToast = (message, tone = "success") => ({
  id: `${tone}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  message,
  tone,
});

export const InventoryModuleProvider = ({ children }) => {
  const [medicines, setMedicines] = useState(() => inventoryMedicines.map(createMedicineRecord));
  const [movements, setMovements] = useState(inventoryMovements);
  const [returns, setReturns] = useState(inventoryReturns);
  const [adjustments, setAdjustments] = useState(inventoryAdjustments);
  const [globalSearch, setGlobalSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTableTab, setActiveTableTab] = useState("all");
  const [medicineModalState, setMedicineModalState] = useState({ open: false, mode: "add", medicine: createEmptyMedicine() });
  const [detailsMedicine, setDetailsMedicine] = useState(null);
  const [deleteCandidate, setDeleteCandidate] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!toasts.length) return undefined;
    const timer = window.setTimeout(() => {
      setToasts((current) => current.slice(1));
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const categories = useMemo(
    () => [...new Set(medicines.map((medicine) => medicine.category).filter(Boolean))].sort(),
    [medicines]
  );

  const suppliers = useMemo(
    () => [...new Set(medicines.map((medicine) => medicine.supplier).filter(Boolean))].sort(),
    [medicines]
  );

  const addToast = (message, tone = "success") => {
    setToasts((current) => [...current, createToast(message, tone)]);
  };

  const validateMedicine = (draft) => {
    const errors = {};

    requiredMedicineFields.forEach((field) => {
      if (draft[field] === "" || draft[field] === null || draft[field] === undefined) {
        errors[field] = `${formatLabel(field)} is required.`;
      }
    });

    if (draft.expiryDate && draft.manufacturingDate && draft.expiryDate < draft.manufacturingDate) {
      errors.expiryDate = "Expiry date must be after manufacturing date.";
    }

    return errors;
  };

  const openAddMedicine = () => {
    setMedicineModalState({ open: true, mode: "add", medicine: createEmptyMedicine() });
  };

  const openEditMedicine = (medicine) => {
    setMedicineModalState({ open: true, mode: "edit", medicine: { ...medicine } });
  };

  const closeMedicineModal = () => {
    setMedicineModalState((current) => ({ ...current, open: false, medicine: createEmptyMedicine() }));
  };

  const saveMedicine = (draft) => {
    const errors = validateMedicine(draft);
    if (Object.keys(errors).length) {
      return { ok: false, errors };
    }

    const payload = buildMedicinePayload(draft, medicines.length);

    if (medicineModalState.mode === "edit") {
      setMedicines((current) => current.map((medicine) => (medicine.id === payload.id ? payload : medicine)));
      addToast(`${payload.name} updated successfully.`);
    } else {
      setMedicines((current) => [payload, ...current]);
      addToast(`${payload.name} added to inventory.`);
    }

    closeMedicineModal();
    return { ok: true, errors: {} };
  };

  const duplicateMedicine = (medicine) => {
    const copy = buildMedicinePayload(
      {
        ...medicine,
        id: "",
        code: `${medicine.code}-COPY`,
        name: `${medicine.name} Copy`,
        batchNumber: `${medicine.batchNumber}-C`,
      },
      medicines.length
    );

    setMedicines((current) => [copy, ...current]);
    addToast(`${medicine.name} duplicated.`);
  };

  const requestDeleteMedicine = (medicine) => {
    setDeleteCandidate(medicine);
  };

  const cancelDeleteMedicine = () => {
    setDeleteCandidate(null);
  };

  const confirmDeleteMedicine = () => {
    if (!deleteCandidate) return;
    setMedicines((current) => current.filter((medicine) => medicine.id !== deleteCandidate.id));
    setSelectedIds((current) => current.filter((id) => id !== deleteCandidate.id));
    addToast(`${deleteCandidate.name} deleted.`, "danger");
    setDeleteCandidate(null);
  };

  const openMedicineDetails = (medicine) => {
    setDetailsMedicine(medicine);
  };

  const closeMedicineDetails = () => {
    setDetailsMedicine(null);
  };

  const toggleMedicineSelection = (medicineId) => {
    setSelectedIds((current) =>
      current.includes(medicineId) ? current.filter((id) => id !== medicineId) : [...current, medicineId]
    );
  };

  const selectVisibleMedicines = (visibleIds, checked) => {
    setSelectedIds((current) => {
      if (checked) {
        return [...new Set([...current, ...visibleIds])];
      }
      return current.filter((id) => !visibleIds.includes(id));
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const applyMedicineFilters = ({ search = "", category = "", supplier = "", status = "", tab = "all", list = medicines }) => {
    const searchTerm = `${globalSearch} ${search}`.trim().toLowerCase();

    return list.filter((medicine) => {
      const combinedText = [
        medicine.name,
        medicine.genericName,
        medicine.batchNumber,
        medicine.barcode,
        medicine.category,
        medicine.supplier,
        medicine.status,
        medicine.code,
      ]
        .join(" ")
        .toLowerCase();

      if (searchTerm && !combinedText.includes(searchTerm)) return false;
      if (category && medicine.category !== category) return false;
      if (supplier && medicine.supplier !== supplier) return false;
      if (status && medicine.status !== status) return false;
      if (tab === "low-stock" && medicine.status !== "Low Stock") return false;
      if (tab === "expiring-soon" && medicine.status !== "Expiring Soon") return false;
      if (tab === "expired" && medicine.status !== "Expired") return false;
      return true;
    });
  };

  const addMovement = (draft) => {
    const medicine = medicines.find((item) => item.id === draft.medicineId);
    if (!medicine) {
      addToast("Select a medicine for this movement.", "danger");
      return;
    }

    const quantity = Number(draft.quantity) || 0;
    const nextMovement = {
      id: `mov-${Date.now()}`,
      date: draft.date,
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchNumber: draft.batchNumber || medicine.batchNumber,
      type: draft.type,
      quantity,
      reason: draft.reason,
      handledBy: draft.handledBy,
    };

    const negativeTypes = ["Stock Out", "Return", "Expired Removal"];
    const stockDelta = negativeTypes.includes(draft.type) ? -quantity : quantity;

    setMovements((current) => [nextMovement, ...current]);
    setMedicines((current) =>
      current.map((item) =>
        item.id === medicine.id
          ? createMedicineRecord({
              ...item,
              quantity: Math.max(0, (Number(item.quantity) || 0) + stockDelta),
            })
          : item
      )
    );
    addToast(`${draft.type} recorded for ${medicine.name}.`);
  };

  const addReturn = (draft) => {
    const medicine = medicines.find((item) => item.id === draft.medicineId);
    if (!medicine) {
      addToast("Select a medicine to create a return.", "danger");
      return;
    }

    const nextReturn = {
      id: `RET-${String(Date.now()).slice(-4)}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchNumber: draft.batchNumber || medicine.batchNumber,
      quantity: Number(draft.quantity) || 0,
      returnType: draft.returnType,
      partner: draft.partner,
      reason: draft.reason,
      status: draft.status,
      date: draft.date,
    };

    setReturns((current) => [nextReturn, ...current]);
    addToast(`Return ${nextReturn.id} added.`);
  };

  const addAdjustment = (draft) => {
    const medicine = medicines.find((item) => item.id === draft.medicineId);
    if (!medicine) {
      addToast("Select a medicine to create an adjustment.", "danger");
      return;
    }

    const oldQty = Number(medicine.quantity) || 0;
    const newQty = Number(draft.newQty) || 0;
    const difference = newQty - oldQty;
    const nextAdjustment = {
      id: `ADJ-${String(Date.now()).slice(-4)}`,
      date: draft.date,
      medicineId: medicine.id,
      medicineName: medicine.name,
      batchNumber: draft.batchNumber || medicine.batchNumber,
      oldQty,
      newQty,
      difference,
      reason: draft.reason,
      approvedBy: draft.approvedBy,
    };

    setAdjustments((current) => [nextAdjustment, ...current]);
    setMedicines((current) =>
      current.map((item) =>
        item.id === medicine.id
          ? createMedicineRecord({
              ...item,
              quantity: newQty,
            })
          : item
      )
    );
    addToast(`Adjustment ${nextAdjustment.id} saved.`);
  };

  const lowStockItems = useMemo(
    () => medicines.filter((medicine) => ["Low Stock", "Out of Stock"].includes(medicine.status)),
    [medicines]
  );
  const expiringSoonItems = useMemo(
    () => medicines.filter((medicine) => medicine.status === "Expiring Soon"),
    [medicines]
  );
  const expiredItems = useMemo(() => medicines.filter((medicine) => medicine.status === "Expired"), [medicines]);

  const kpiCards = [
    {
      label: "Total Items",
      value: inventorySummary.totalItems.toLocaleString("en-IN"),
      helper: "+12 this month",
      tone: "blue",
    },
    {
      label: "Total Stock Value",
      value: new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
        inventorySummary.totalStockValue
      ),
      helper: "Updated just now",
      tone: "teal",
    },
    {
      label: "Low Stock Items",
      value: inventorySummary.lowStockItems.toString(),
      helper: "Reorder recommended",
      tone: "amber",
    },
    {
      label: "Expired Items",
      value: inventorySummary.expiredItems.toString(),
      helper: "Remove immediately",
      tone: "rose",
    },
    {
      label: "Expiring Soon",
      value: inventorySummary.expiringSoonItems.toString(),
      helper: "Within 60 days",
      tone: "sky",
    },
  ];

  return (
    <InventoryModuleContext.Provider
      value={{
        medicines,
        movements,
        returns,
        adjustments,
        categories,
        suppliers,
        globalSearch,
        setGlobalSearch,
        selectedIds,
        activeTableTab,
        setActiveTableTab,
        medicineModalState,
        detailsMedicine,
        deleteCandidate,
        toasts,
        kpiCards,
        lowStockItems,
        expiringSoonItems,
        expiredItems,
        stockValueByCategory,
        getDaysUntil,
        getMedicineStatus,
        normalizeValue,
        applyMedicineFilters,
        openAddMedicine,
        openEditMedicine,
        closeMedicineModal,
        saveMedicine,
        duplicateMedicine,
        requestDeleteMedicine,
        cancelDeleteMedicine,
        confirmDeleteMedicine,
        openMedicineDetails,
        closeMedicineDetails,
        toggleMedicineSelection,
        selectVisibleMedicines,
        clearSelection,
        addMovement,
        addReturn,
        addAdjustment,
        addToast,
      }}
    >
      {children}
    </InventoryModuleContext.Provider>
  );
};

export const useInventoryModule = () => {
  const context = useContext(InventoryModuleContext);
  if (!context) {
    throw new Error("useInventoryModule must be used within InventoryModuleProvider.");
  }
  return context;
};
