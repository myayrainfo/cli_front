import { useMemo, useState } from "react";
import { Edit3, Eye, MoreHorizontal, Trash2, CopyPlus } from "lucide-react";
import Badge from "../../../shared/components/Badge";
import { formatCurrency } from "../../../shared/utils/format";
import { useInventoryModule } from "../InventoryModuleContext";
import InventoryFilters from "./InventoryFilters";

const statusTone = {
  "In Stock": "success",
  "Low Stock": "warning",
  "Out of Stock": "danger",
  Expired: "danger",
  "Expiring Soon": "info",
};

const tableTabs = [
  { key: "all", label: "All Medicines" },
  { key: "low-stock", label: "Low Stock (32)" },
  { key: "expiring-soon", label: "Expiring Soon (28)" },
  { key: "expired", label: "Expired (12)" },
];

const InventoryTable = ({
  medicines,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  supplier,
  onSupplierChange,
  status,
  onStatusChange,
  page,
  onPageChange,
  title = "Medicine inventory",
  showTabs = false,
  cardActions,
}) => {
  const {
    categories,
    suppliers,
    selectedIds,
    activeTableTab,
    setActiveTableTab,
    openEditMedicine,
    openMedicineDetails,
    duplicateMedicine,
    requestDeleteMedicine,
    toggleMedicineSelection,
    selectVisibleMedicines,
    addToast,
  } = useInventoryModule();
  const [menuOpenId, setMenuOpenId] = useState("");

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(medicines.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => medicines.slice((safePage - 1) * pageSize, safePage * pageSize),
    [medicines, safePage]
  );
  const visibleIds = pageRows.map((item) => item.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const showingStart = medicines.length ? (safePage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min(safePage * pageSize, medicines.length);

  return (
    <section className="card inventory-table-card">
      <div className="inventory-card-head">
        <div>
          <h3>{title}</h3>
          <p>Batch-wise medicine catalog with pricing, barcode, supplier, and shelf metadata.</p>
        </div>
        <div className="inventory-card-actions">
          {showTabs ? (
            <div className="inventory-tabs">
              {tableTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`inventory-tab ${activeTableTab === tab.key ? "active" : ""}`}
                  onClick={() => {
                    setActiveTableTab(tab.key);
                    onPageChange(1);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="inventory-card-button-row">
            <button type="button" className="ghost-button" onClick={() => addToast("Import queue opened for review.", "info")}>
              Import
            </button>
            {cardActions}
            <button type="button" className="icon-button" onClick={() => addToast("More inventory actions coming here.", "info")}>
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      <InventoryFilters
        search={search}
        onSearchChange={(value) => {
          onSearchChange(value);
          onPageChange(1);
        }}
        category={category}
        onCategoryChange={(value) => {
          onCategoryChange(value);
          onPageChange(1);
        }}
        supplier={supplier}
        onSupplierChange={(value) => {
          onSupplierChange(value);
          onPageChange(1);
        }}
        status={status}
        onStatusChange={(value) => {
          onStatusChange(value);
          onPageChange(1);
        }}
        categories={categories}
        suppliers={suppliers}
        statusOptions={["In Stock", "Low Stock", "Out of Stock", "Expiring Soon", "Expired"]}
        selectedCount={selectedIds.length}
        onMoreFilters={() => addToast("Additional filters can be added per workflow.", "info")}
      />

      <div className="inventory-table-wrap">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(event) => selectVisibleMedicines(visibleIds, event.target.checked)}
                />
              </th>
              <th>Medicine</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((medicine) => (
              <tr key={medicine.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(medicine.id)}
                    onChange={() => toggleMedicineSelection(medicine.id)}
                  />
                </td>
                <td>
                  <div className="inventory-medicine-cell">
                    <img src={medicine.imageUrl} alt={medicine.name} />
                    <div>
                      <strong>{medicine.name}</strong>
                      <span>{medicine.code}</span>
                    </div>
                  </div>
                </td>
                <td>{medicine.category}</td>
                <td>{medicine.quantity}</td>
                <td>{medicine.unitType}</td>
                <td>{formatCurrency(medicine.sellingPrice)}</td>
                <td>{new Date(medicine.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>
                  <Badge tone={statusTone[medicine.status] || "neutral"}>{medicine.status}</Badge>
                </td>
                <td>
                  <div className="inventory-row-actions">
                    <button type="button" className="icon-button subtle" onClick={() => openEditMedicine(medicine)}>
                      <Edit3 size={16} />
                    </button>
                    <div className="inventory-action-menu-wrap">
                      <button
                        type="button"
                        className="icon-button subtle"
                        onClick={() => setMenuOpenId((current) => (current === medicine.id ? "" : medicine.id))}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuOpenId === medicine.id ? (
                        <div className="inventory-action-menu">
                          <button type="button" onClick={() => openMedicineDetails(medicine)}>
                            <Eye size={15} />
                            View Details
                          </button>
                          <button type="button" onClick={() => openEditMedicine(medicine)}>
                            <Edit3 size={15} />
                            Edit
                          </button>
                          <button type="button" onClick={() => duplicateMedicine(medicine)}>
                            <CopyPlus size={15} />
                            Duplicate
                          </button>
                          <button type="button" className="danger" onClick={() => requestDeleteMedicine(medicine)}>
                            <Trash2 size={15} />
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="inventory-pagination">
        <span>
          Showing {showingStart} to {showingEnd} of {showTabs && activeTableTab === "all" ? "1,248" : medicines.length.toLocaleString("en-IN")} items
        </span>
        <div className="inventory-pagination-buttons">
          <button type="button" className="ghost-button" disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}>
            Previous
          </button>
          {[1, 2, 3].map((item) => (
            <button
              key={item}
              type="button"
              className={`inventory-page-pill ${safePage === item ? "active" : ""}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ))}
          <span className="inventory-page-ellipsis">...</span>
          <button type="button" className="inventory-page-pill" onClick={() => onPageChange(pageCount)}>
            {showTabs && activeTableTab === "all" ? "208" : pageCount}
          </button>
          <button type="button" className="ghost-button" disabled={safePage === pageCount} onClick={() => onPageChange(safePage + 1)}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default InventoryTable;
