const InventoryFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  supplier,
  onSupplierChange,
  status,
  onStatusChange,
  categories,
  suppliers,
  statusOptions,
  searchPlaceholder = "Search by name, generic, barcode...",
  selectedCount = 0,
  onMoreFilters,
}) => (
  <div className="inventory-filter-row">
    <div className="inventory-filter-search">
      <input
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>
    <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
      <option value="">All Categories</option>
      {categories.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
    <select value={supplier} onChange={(event) => onSupplierChange(event.target.value)}>
      <option value="">All Suppliers</option>
      {suppliers.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
    <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
      <option value="">All Statuses</option>
      {statusOptions.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
    <button type="button" className="ghost-button inventory-more-filter-button" onClick={onMoreFilters}>
      More Filters
    </button>
    {selectedCount ? <span className="inventory-selection-pill">{selectedCount} selected</span> : null}
  </div>
);

export default InventoryFilters;
