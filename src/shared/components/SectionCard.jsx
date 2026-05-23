import { motion } from "framer-motion";

const SectionCard = ({ title, action, children, className = "" }) => (
  <motion.section
    className={`card section-card ${className}`.trim()}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.24 }}
  >
    <div className="section-head">
      <div>
        <h3>{title}</h3>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
    {children}
  </motion.section>
);

export default SectionCard;
