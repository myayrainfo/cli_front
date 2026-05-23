import { motion } from "framer-motion";

const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    className="page-header"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
  >
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
    {action ? <div>{action}</div> : null}
  </motion.div>
);

export default PageHeader;
