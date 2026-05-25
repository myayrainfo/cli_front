import { Search, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import InventoryChartCards from "./components/InventoryChartCards";
import InventoryKpiCards from "./components/InventoryKpiCards";
import InventoryTable from "./components/InventoryTable";
import LowStockList from "./components/LowStockList";
import StockMovementList from "./components/StockMovementList";
import { useInventoryModule } from "./InventoryModuleContext";

const InventoryOverviewPage = () => {
  const {
    medicines,
    movements,
    lowStockItems,
    kpiCards,
    stockValueByCategory,
    globalSearch,
    setGlobalSearch,
    applyMedicineFilters,
    activeTableTab,
    openAddMedicine,
  } = useInventoryModule();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const filteredMedicines = useMemo(
    () => applyMedicineFilters({ search, category, supplier, status, tab: activeTableTab, list: medicines }),
    [activeTableTab, applyMedicineFilters, category, medicines, search, status, supplier]
  );

  return (
    <div className="page-stack inventory-page">
      <section className="inventory-hero">
        <div>
          <span className="eyebrow">Inventory Dashboard</span>
          <h1>Inventory Overview</h1>
          <p>Real-time summary of your pharmacy inventory</p>
        </div>
        <div className="inventory-hero-search">
          <Search size={18} />
          <input
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search medicines, batches, barcode..."
          />
        </div>
      </section>

      <InventoryKpiCards cards={kpiCards} />

      <InventoryTable
        title="Inventory catalog"
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
        showTabs
        cardActions={
          <button type="button" className="primary-button inventory-add-button" onClick={openAddMedicine}>
            <Plus size={16} />
            Add Medicine
          </button>
        }
      />

      <div className="inventory-widget-grid">
        <InventoryChartCards data={stockValueByCategory} />
        <StockMovementList movements={movements.slice(0, 5)} />
        <LowStockList items={lowStockItems.slice(0, 5)} />
      </div>
    </div>
  );
};

export default InventoryOverviewPage;
