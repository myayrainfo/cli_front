import { formatDate } from "./format";

const toIso = (value) => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const daysUntil = (value) => {
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const buildNotifications = (data) => {
  const notifications = [];

  (data.alerts?.expired || []).forEach((batch) => {
    notifications.push({
      id: `expired-${batch._id || batch.batchNumber}`,
      type: "critical",
      title: `Expired stock: ${batch.medicineId?.name || batch.batchNumber}`,
      message: `Batch ${batch.batchNumber} expired on ${formatDate(batch.expiryDate)}.`,
      path: "/alerts",
      createdAt: toIso(batch.expiryDate),
    });
  });

  (data.alerts?.lowStock || []).forEach((item) => {
    notifications.push({
      id: `low-stock-${item._id || item.name}`,
      type: item.stock <= Math.max(3, Math.floor((item.minimumStock || 0) / 2)) ? "critical" : "warning",
      title: `Low stock: ${item.name}`,
      message: `Only ${item.stock} units left. Minimum stock is ${item.minimumStock}.`,
      path: "/alerts",
      createdAt: new Date().toISOString(),
    });
  });

  (data.alerts?.nearExpiry || []).forEach((batch) => {
    notifications.push({
      id: `near-expiry-${batch._id || batch.batchNumber}`,
      type: "warning",
      title: `Near expiry: ${batch.medicineId?.name || batch.batchNumber}`,
      message: `Batch ${batch.batchNumber} expires in ${Math.max(daysUntil(batch.expiryDate), 0)} days.`,
      path: "/alerts",
      createdAt: toIso(batch.expiryDate),
    });
  });

  (data.suppliers || [])
    .filter((supplier) => Number(supplier.paymentDue) > 0)
    .slice(0, 4)
    .forEach((supplier) => {
      notifications.push({
        id: `supplier-due-${supplier._id}`,
        type: "warning",
        title: `Pending supplier payment`,
        message: `${supplier.name} has ${supplier.paymentDue} pending.`,
        path: "/purchases",
        createdAt: new Date().toISOString(),
      });
    });

  (data.customers || [])
    .filter((customer) => Number(customer.dueAmount) > 0)
    .slice(0, 4)
    .forEach((customer) => {
      notifications.push({
        id: `customer-due-${customer._id}`,
        type: "warning",
        title: `Customer due: ${customer.name}`,
        message: `${customer.dueAmount} is still outstanding.`,
        path: "/people",
        createdAt: new Date().toISOString(),
      });
    });

  (data.sales || []).slice(0, 4).forEach((sale) => {
    notifications.push({
      id: `sale-${sale._id}`,
      type: "info",
      title: `Recent sale: ${sale.invoiceNumber}`,
      message: `${sale.customerName || "Walk-in Customer"} paid ${sale.paymentStatus}.`,
      path: "/billing",
      createdAt: toIso(sale.saleDate),
    });
  });

  (data.dashboard?.recentStockUpdates || []).slice(0, 4).forEach((update) => {
    notifications.push({
      id: `stock-update-${update._id}`,
      type: "info",
      title: `Stock update: ${update.medicineId?.name || "Medicine"}`,
      message: `${update.type} ${update.quantity} units for ${update.reason || "stock movement"}.`,
      path: "/inventory",
      createdAt: toIso(update.createdAt),
    });
  });

  (data.appointments || []).slice(0, 4).forEach((appointment) => {
    notifications.push({
      id: `appointment-${appointment._id}`,
      type: "info",
      title: `Follow-up reminder`,
      message: `${appointment.doctorName || "Doctor"} appointment is ${appointment.status || "scheduled"} on ${formatDate(appointment.appointmentDate)}.`,
      path: "/clinic",
      createdAt: toIso(appointment.appointmentDate),
    });
  });

  if (data.settings?.payment) {
    notifications.push({
      id: "subscription-status",
      type: data.settings.payment.paymentStatus === "Paid" ? "info" : "warning",
      title: "Subscription status",
      message: `${data.settings.payment.currentPlan} plan is marked ${data.settings.payment.paymentStatus}.`,
      path: "/settings",
      createdAt: new Date().toISOString(),
    });
  }

  return notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};
