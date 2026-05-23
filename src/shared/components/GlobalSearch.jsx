import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CalendarClock,
  FileText,
  Home,
  Package,
  Pill,
  Receipt,
  Search,
  Settings,
  ShoppingCart,
  Stethoscope,
  Truck,
  UserRound,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayoutData } from "../layouts/LayoutDataContext";
import LoadingSpinner from "./LoadingSpinner";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";
import { buildSearchIndex, searchIndex } from "../utils/searchIndex";

const iconMap = {
  bell: Bell,
  calendar: CalendarClock,
  chart: BarChart3,
  "file-text": FileText,
  home: Home,
  package: Package,
  pill: Pill,
  receipt: Receipt,
  settings: Settings,
  shopping: ShoppingCart,
  stethoscope: Stethoscope,
  truck: Truck,
  user: UserRound,
};

const toneMap = {
  Medicines: "success",
  Customers: "info",
  Suppliers: "warning",
  Billing: "info",
  Purchases: "warning",
  Clinic: "success",
  "Settings/Shortcuts": "neutral",
};

const flattenGroups = (groups) => groups.flatMap((group) => group.items);

const GlobalSearch = () => {
  const navigate = useNavigate();
  const { shellData, loading } = useLayoutData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);
  const deferredQuery = useDeferredValue(query);

  const groups = useMemo(() => {
    const index = buildSearchIndex(shellData);
    return searchIndex(index, deferredQuery);
  }, [shellData, deferredQuery]);

  const flatResults = useMemo(() => flattenGroups(groups), [groups]);

  useEffect(() => {
    setActiveIndex(0);
  }, [deferredQuery]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const openResult = (result) => {
    if (!result) return;
    navigate(result.path);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!open && event.key !== "Escape") {
      setOpen(true);
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (flatResults.length ? (current + 1) % flatResults.length : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        flatResults.length ? (current - 1 + flatResults.length) % flatResults.length : 0
      );
    }

    if (event.key === "Enter" && query.trim()) {
      event.preventDefault();
      openResult(flatResults[activeIndex] || flatResults[0]);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="global-search" ref={wrapperRef}>
      <div className="search-input-wrap">
        <Search size={18} />
        <input
          aria-label="Global search"
          className="search-input"
          placeholder="Search medicines, bills, suppliers, patients, settings..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <AnimatePresence>
        {open && query.trim() ? (
          <motion.div
            className="overlay-panel search-panel"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {loading ? (
              <LoadingSpinner label="Preparing search..." />
            ) : groups.length ? (
              <div className="search-groups">
                {groups.map((group) => (
                  <div key={group.category} className="search-group">
                    <div className="search-group-head">
                      <span>{group.category}</span>
                      <StatusBadge tone={toneMap[group.category]}>{group.items.length}</StatusBadge>
                    </div>
                    <div className="search-results">
                      {group.items.map((item) => {
                        const Icon = iconMap[item.icon] || Search;
                        const flatIndex = flatResults.findIndex((result) => result.id === item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`search-result ${flatIndex === activeIndex ? "active" : ""}`}
                            onMouseEnter={() => setActiveIndex(flatIndex)}
                            onClick={() => openResult(item)}
                          >
                            <span className="search-result-icon">
                              <Icon size={16} />
                            </span>
                            <span className="search-result-copy">
                              <strong>{item.title}</strong>
                              <span>{item.subtitle}</span>
                            </span>
                            <StatusBadge tone={toneMap[item.category]}>{item.category}</StatusBadge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No results found"
                description="Try searching by medicine, company, batch, invoice, supplier, patient, or shortcut."
              />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch;
