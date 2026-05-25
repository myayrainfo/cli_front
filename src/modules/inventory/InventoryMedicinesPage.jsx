import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import PageHeader from "../../shared/components/PageHeader";
import InventoryTable from "./components/InventoryTable";
import { useInventoryModule } from "./InventoryModuleContext";

const InventoryMedicinesPage = () => {
  const { medicines, applyMedicineFilters, openAddMedicine } = useInventoryModule();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filteredMedicines = useMemo(
    () => applyMedicineFilters({ search, category, supplier, status, list: medicines }),
    [applyMedicineFilters, category, medicines, search, status, supplier]
  );

  return (
    <div className="page-stack inventory-page">
      <PageHeader
        title="Medicines"
        subtitle="Dedicated medicine catalog with search, filters, batch details, and price controls."
        action={
          <button type="button" className="primary-button inventory-add-button" onClick={openAddMedicine}>
            <Plus size={16} />
            Add Medicine
          </button>
        }
      />

      <InventoryTable
        title="Medicine catalog"
        medicines={filteredMedicines}
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        supplier={supplier}
        onSupplierChange={setSupplier}
        status={status}
        onStatusChange={setStatus}
        page={page}
        onPageChange={setPage}
        cardActions={
          <button type="button" className="primary-button inventory-add-button" onClick={openAddMedicine}>
            <Plus size={16} />
            Add Medicine
          </button>
        }
      />
    </div>
  );
};

export default InventoryMedicinesPage;
