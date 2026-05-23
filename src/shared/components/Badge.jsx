import StatusBadge from "./StatusBadge";

const Badge = ({ children, tone = "neutral" }) => (
  <StatusBadge tone={tone}>{children}</StatusBadge>
);

export default Badge;
