import { navItems } from "../../core/config/navigation";
import { formatCurrency } from "./format";
import { buildNotifications } from "./notifications";

const normalize = (value) => String(value || "").toLowerCase().trim();

const joinKeywords = (values = []) =>
  values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter(Boolean)
    .join(" ");

const makeEntry = ({
  id,
  title,
  subtitle,
  category,
  path,
  icon,
  keywords = [],
  state,
}) => ({
  id,
  title,
  subtitle,
  category,
  path,
  icon,
  state,
  searchText: normalize([title, subtitle, category, joinKeywords(keywords)].join(" ")),
});

const buildMetricEntries = (dashboard) => {
  const kpis = dashboard?.kpis || {};

  return [
    makeEntry({
      id: "metric-sales-today",
      title: "Sales Today",
      subtitle: `Dashboard metric - ${formatCurrency(kpis.totalSalesToday || 0)}`,
      category: "Pages",
      path: "/",
      icon: "chart",
      keywords: ["dashboard sales revenue today"],
    }),
    makeEntry({
      id: "metric-purchases-today",
      title: "Purchases Today",
      subtitle: `Dashboard metric - ${formatCurrency(kpis.totalPurchaseToday || 0)}`,
      category: "Pages",
      path: "/",
      icon: "shopping",
      keywords: ["dashboard purchases spend today"],
    }),
    makeEntry({
      id: "metric-stock-risk",
      title: "Stock Risk",
      subtitle: `Low ${kpis.lowStockMedicines || 0} / Near expiry ${kpis.nearExpiryMedicines || 0} / Expired ${kpis.expiredMedicines || 0}`,
      category: "Pages",
      path: "/",
      icon: "bell",
      keywords: ["dashboard stock risk low expiry expired"],
    }),
  ];
};

export const buildSearchIndex = (data) => {
  const medicines = (data.medicines || []).flatMap((medicine) => {
    const entries = [
      makeEntry({
        id: `medicine-${medicine._id}`,
        title: medicine.name,
        subtitle: `${medicine.genericName || medicine.company || "Medicine"} - Rack ${medicine.rackLocation || "-"}`,
        category: "Medicines",
        path: "/inventory",
        icon: "pill",
        state: { globalSearch: { type: "medicine", id: medicine._id, query: medicine.name } },
        keywords: [
          medicine._id,
          medicine.genericName,
          medicine.company,
          medicine.category,
          medicine.composition,
          medicine.barcodeValue,
          medicine.rackLocation,
        ],
      }),
    ];

    (medicine.batches || []).forEach((batch) => {
      entries.push(
        makeEntry({
          id: `batch-${batch._id || batch.batchNumber}`,
          title: `${medicine.name} - ${batch.batchNumber}`,
          subtitle: `Batch - Qty ${batch.quantity ?? 0} - Exp ${batch.expiryDate?.slice?.(0, 10) || "-"}`,
          category: "Medicines",
          path: "/inventory",
          icon: "package",
          state: { globalSearch: { type: "batch", id: batch._id, query: batch.batchNumber } },
          keywords: [medicine._id, medicine.genericName, medicine.company, batch.batchNumber],
        })
      );
    });

    return entries;
  });

  const bills = (data.sales || []).map((sale) =>
    makeEntry({
      id: `sale-${sale._id}`,
      title: sale.invoiceNumber,
      subtitle: `${sale.customerName || "Walk-in Customer"} - ${sale.paymentStatus} - ${formatCurrency(sale.grandTotal)}`,
      category: "Bills",
      path: "/billing",
      icon: "receipt",
      state: { globalSearch: { type: "sale", id: sale._id, query: sale.invoiceNumber } },
      keywords: [
        sale._id,
        sale.customerName,
        sale.paymentStatus,
        sale.paymentMethod,
        sale.items?.map((item) => item.medicineName),
      ],
    })
  );

  const purchases = (data.purchases || []).map((purchase) =>
    makeEntry({
      id: `purchase-${purchase._id}`,
      title: purchase.purchaseNumber,
      subtitle: `${purchase.supplierName || "Supplier"} - ${purchase.paymentStatus} - ${formatCurrency(purchase.grandTotal)}`,
      category: "Purchases",
      path: "/purchases",
      icon: "shopping",
      state: { globalSearch: { type: "purchase", id: purchase._id, query: purchase.purchaseNumber } },
      keywords: [
        purchase._id,
        purchase.supplierName,
        purchase.paymentStatus,
        purchase.items?.map((item) => `${item.medicineName} ${item.batchNumber}`),
      ],
    })
  );

  const people = [
    ...(data.customers || []).map((customer) =>
      makeEntry({
        id: `customer-${customer._id}`,
        title: customer.name,
        subtitle: `Customer - ${customer.phone || "No phone"} - Due ${formatCurrency(customer.dueAmount || 0)}`,
        category: "People",
        path: "/people",
        icon: "user",
        state: { globalSearch: { type: "customer", id: customer._id, query: customer.name } },
        keywords: [customer._id, customer.phone, customer.address, customer.loyaltyPoints],
      })
    ),
    ...(data.suppliers || []).map((supplier) =>
      makeEntry({
        id: `supplier-${supplier._id}`,
        title: supplier.name,
        subtitle: `Supplier - ${supplier.phone || "No phone"} - Due ${formatCurrency(supplier.paymentDue || 0)}`,
        category: "People",
        path: "/people",
        icon: "truck",
        state: { globalSearch: { type: "supplier", id: supplier._id, query: supplier.name } },
        keywords: [
          supplier._id,
          supplier.contactPerson,
          supplier.phone,
          supplier.email,
          supplier.gstNumber,
          supplier.companiesSupplied,
        ],
      })
    ),
    ...(data.patients || []).map((patient) =>
      makeEntry({
        id: `patient-${patient._id}`,
        title: patient.name,
        subtitle: `Patient - ${patient.phone || "No phone"} - ${patient.medicalHistory || "Clinic record"}`,
        category: "People",
        path: "/clinic",
        icon: "stethoscope",
        state: { globalSearch: { type: "patient", id: patient._id, query: patient.name } },
        keywords: [patient._id, patient.phone, patient.address, patient.medicalHistory],
      })
    ),
  ];

  const alerts = buildNotifications(data).map((alert) =>
    makeEntry({
      id: `alert-${alert.id}`,
      title: alert.title,
      subtitle: alert.message,
      category: "Alerts",
      path: alert.path || "/alerts",
      icon: alert.type === "critical" ? "bell" : alert.type === "warning" ? "calendar" : "chart",
      state: { globalSearch: { type: "alert", id: alert.id, query: alert.title } },
      keywords: [alert.id, alert.type],
    })
  );

  const reportEntries = (data.reports?.cards || []).map((card) =>
    makeEntry({
      id: `report-${card.title}`,
      title: card.title,
      subtitle: `Report metric - ${card.value}`,
      category: "Pages",
      path: "/reports",
      icon: "chart",
      state: { globalSearch: { type: "report", query: card.title } },
      keywords: ["reports analytics", card.title],
    })
  );

  const pageEntries = navItems.map((item) =>
    makeEntry({
      id: `page-${item.path}`,
      title: item.label,
      subtitle: `Open ${item.label} workspace`,
      category: "Pages",
      path: item.path,
      icon:
        item.label === "Dashboard"
          ? "home"
          : item.label === "Inventory"
            ? "package"
            : item.label === "Billing"
              ? "receipt"
              : item.label === "Purchases"
                ? "shopping"
                : item.label === "People"
                  ? "user"
                  : item.label === "Alerts"
                    ? "bell"
                    : item.label === "Reports"
                      ? "chart"
                      : item.label === "Clinic"
                        ? "stethoscope"
                        : "settings",
      state: { globalSearch: { type: "page", query: item.label } },
      keywords: [item.label, item.path],
    })
  );

  return [
    ...medicines,
    ...bills,
    ...purchases,
    ...people,
    ...alerts,
    ...pageEntries,
    ...buildMetricEntries(data.dashboard),
    ...reportEntries,
  ];
};

const categoryOrder = ["Medicines", "Bills", "Purchases", "People", "Alerts", "Pages"];

const scoreResult = (result, query) => {
  const title = normalize(result.title);
  const subtitle = normalize(result.subtitle);
  const text = normalize(result.searchText);

  if (title.startsWith(query)) return 6;
  if (title.includes(query)) return 5;
  if (subtitle.startsWith(query)) return 4;
  if (subtitle.includes(query)) return 3;
  if (text.includes(query)) return 2;
  return 0;
};

export const searchIndex = (items, query) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const filtered = items
    .filter((item) => item.searchText.includes(normalizedQuery))
    .sort((left, right) => scoreResult(right, normalizedQuery) - scoreResult(left, normalizedQuery));

  return categoryOrder
    .map((category) => ({
      category,
      items: filtered.filter((item) => item.category === category).slice(0, 6),
    }))
    .filter((group) => group.items.length);
};
