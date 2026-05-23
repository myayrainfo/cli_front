const normalize = (value) => String(value || "").toLowerCase().trim();

const makeEntry = ({
  id,
  title,
  subtitle,
  category,
  path,
  icon,
  keywords = [],
}) => ({
  id,
  title,
  subtitle,
  category,
  path,
  icon,
  searchText: normalize([title, subtitle, category, ...keywords].join(" ")),
});

export const buildSearchIndex = (data) => {
  const medicines = (data.medicines || []).flatMap((medicine) => {
    const entries = [
      makeEntry({
        id: `medicine-${medicine._id}`,
        title: medicine.name,
        subtitle: `${medicine.genericName || medicine.company || "Medicine"} • Rack ${medicine.rackLocation || "-"}`,
        category: "Medicines",
        path: "/inventory",
        icon: "pill",
        keywords: [
          medicine.genericName,
          medicine.company,
          medicine.category,
          medicine.composition,
          medicine.barcodeValue,
        ],
      }),
    ];

    (medicine.batches || []).forEach((batch) => {
      entries.push(
        makeEntry({
          id: `batch-${batch._id || batch.batchNumber}`,
          title: `${medicine.name} • ${batch.batchNumber}`,
          subtitle: `Batch • Qty ${batch.quantity ?? 0} • Exp ${batch.expiryDate?.slice?.(0, 10) || "-"}`,
          category: "Medicines",
          path: "/inventory",
          icon: "package",
          keywords: [medicine.genericName, medicine.company, batch.batchNumber],
        })
      );
    });

    return entries;
  });

  const customers = (data.customers || []).map((customer) =>
    makeEntry({
      id: `customer-${customer._id}`,
      title: customer.name,
      subtitle: `Customer • ${customer.phone || "No phone"} • Due ${customer.dueAmount ?? 0}`,
      category: "Customers",
      path: "/people",
      icon: "user",
      keywords: [customer.phone, customer.address, customer.loyaltyPoints],
    })
  );

  const suppliers = (data.suppliers || []).map((supplier) =>
    makeEntry({
      id: `supplier-${supplier._id}`,
      title: supplier.name,
      subtitle: `Supplier • ${supplier.contactPerson || "Contact"} • Due ${supplier.paymentDue ?? 0}`,
      category: "Suppliers",
      path: "/people",
      icon: "truck",
      keywords: [supplier.phone, supplier.email, supplier.gstNumber, supplier.companiesSupplied?.join(" ")],
    })
  );

  const sales = (data.sales || []).map((sale) =>
    makeEntry({
      id: `sale-${sale._id}`,
      title: sale.invoiceNumber,
      subtitle: `Billing • ${sale.customerName || "Walk-in Customer"} • ${sale.paymentStatus}`,
      category: "Billing",
      path: "/billing",
      icon: "receipt",
      keywords: [
        sale.customerName,
        sale.items?.map((item) => item.medicineName).join(" "),
        sale.paymentStatus,
      ],
    })
  );

  const purchases = (data.purchases || []).map((purchase) =>
    makeEntry({
      id: `purchase-${purchase._id}`,
      title: purchase.purchaseNumber,
      subtitle: `Purchase • ${purchase.supplierName || "Supplier"} • ${purchase.paymentStatus}`,
      category: "Purchases",
      path: "/purchases",
      icon: "shopping",
      keywords: [
        purchase.supplierName,
        purchase.items?.map((item) => `${item.medicineName} ${item.batchNumber}`).join(" "),
      ],
    })
  );

  const patients = (data.patients || []).map((patient) =>
    makeEntry({
      id: `patient-${patient._id}`,
      title: patient.name,
      subtitle: `Patient • ${patient.phone || "No phone"} • ${patient.medicalHistory || "No history"}`,
      category: "Clinic",
      path: "/clinic",
      icon: "stethoscope",
      keywords: [patient.phone, patient.address, patient.medicalHistory],
    })
  );

  const appointments = (data.appointments || []).map((appointment) =>
    makeEntry({
      id: `appointment-${appointment._id}`,
      title: `Appointment • ${appointment.doctorName || "Doctor"}`,
      subtitle: `${appointment.status || "Scheduled"} • ${appointment.followUpReminder || "Follow-up reminder"}`,
      category: "Clinic",
      path: "/clinic",
      icon: "calendar",
      keywords: [appointment.notes, appointment.status, appointment.followUpReminder],
    })
  );

  const prescriptions = (data.prescriptions || []).map((prescription) =>
    makeEntry({
      id: `prescription-${prescription._id}`,
      title: `Prescription • ${prescription.doctorName || "Doctor"}`,
      subtitle: `${prescription.diagnosis || "Diagnosis"} • ${prescription.medicines?.map((item) => item.name).join(", ") || "No medicines"}`,
      category: "Clinic",
      path: "/clinic",
      icon: "file-text",
      keywords: [
        prescription.diagnosis,
        prescription.medicines?.map((item) => `${item.name} ${item.dosage}`).join(" "),
        prescription.labTests?.map((item) => item.type).join(" "),
      ],
    })
  );

  const shortcuts = [
    makeEntry({
      id: "shortcut-dashboard",
      title: "Dashboard overview",
      subtitle: "Shortcut • KPIs, sales, stock activity, and alerts",
      category: "Settings/Shortcuts",
      path: "/",
      icon: "home",
      keywords: ["dashboard sales purchases profit stock"],
    }),
    makeEntry({
      id: "shortcut-reports",
      title: "Reports and analytics",
      subtitle: "Shortcut • Daily sales, purchases, and movement insights",
      category: "Settings/Shortcuts",
      path: "/reports",
      icon: "chart",
      keywords: ["reports analytics gst margins"],
    }),
    makeEntry({
      id: "shortcut-alerts",
      title: "Alerts center",
      subtitle: "Shortcut • Low stock, near expiry, and expired batches",
      category: "Settings/Shortcuts",
      path: "/alerts",
      icon: "bell",
      keywords: ["low stock expired near expiry alerts"],
    }),
    makeEntry({
      id: "shortcut-settings",
      title: "Store and billing settings",
      subtitle: "Shortcut • Profile, GST, branches, and payment placeholders",
      category: "Settings/Shortcuts",
      path: "/settings",
      icon: "settings",
      keywords: ["settings store gst branches subscription"],
    }),
  ];

  return [
    ...medicines,
    ...customers,
    ...suppliers,
    ...sales,
    ...purchases,
    ...patients,
    ...appointments,
    ...prescriptions,
    ...shortcuts,
  ];
};

const categoryOrder = [
  "Medicines",
  "Customers",
  "Suppliers",
  "Billing",
  "Purchases",
  "Clinic",
  "Settings/Shortcuts",
];

const scoreResult = (result, query) => {
  const title = normalize(result.title);
  const subtitle = normalize(result.subtitle);

  if (title.startsWith(query)) return 3;
  if (title.includes(query)) return 2;
  if (subtitle.includes(query)) return 1;
  return 0;
};

export const searchIndex = (items, query) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const filtered = items
    .filter((item) => item.searchText.includes(normalizedQuery))
    .sort((a, b) => scoreResult(b, normalizedQuery) - scoreResult(a, normalizedQuery));

  return categoryOrder
    .map((category) => ({
      category,
      items: filtered.filter((item) => item.category === category).slice(0, 5),
    }))
    .filter((group) => group.items.length);
};
