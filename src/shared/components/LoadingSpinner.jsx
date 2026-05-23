import { motion } from "framer-motion";

const LoadingSpinner = ({ label = "Loading..." }) => (
  <motion.div
    className="page-loader"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
  >
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </motion.div>
);

export default LoadingSpinner;
