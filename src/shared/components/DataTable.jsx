import { motion } from "framer-motion";
import EmptyState from "./EmptyState";

const DataTable = ({
  columns,
  rows,
  emptyText = "No records found.",
  emptyDescription = "The matching records will appear here once data is available.",
}) => {
  if (!rows?.length) {
    return <EmptyState title={emptyText} description={emptyDescription} />;
  }

  return (
    <motion.div
      className="table-wrap"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || row._id || index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

export default DataTable;
