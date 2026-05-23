import { Inbox } from "lucide-react";
import { motion } from "framer-motion";

const EmptyState = ({ title, description }) => (
  <motion.div
    className="empty-state"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
  >
    <span className="empty-state-icon">
      <Inbox size={18} />
    </span>
    <div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  </motion.div>
);

export default EmptyState;
