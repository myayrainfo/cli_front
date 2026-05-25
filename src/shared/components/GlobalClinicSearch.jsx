import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  CalendarClock,
  Command,
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
import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";
import StatusBadge from "./StatusBadge";
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
  Bills: "info",
  Purchases: "warning",
  People: "neutral",
  Alerts: "danger",
  Pages: "info",
};

const flattenGroups = (groups) => groups.flatMap((group) => group.items);

const GlobalClinicSearch = ({
  placeholder = "Search medicines, bills, suppliers, customers, alerts...",
}) => {
  const navigate = useNavigate();
  const { shellData, loading } = useLayoutData();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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

    const handleGlobalShortcut = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleGlobalShortcut);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleGlobalShortcut);
    };
  }, []);

  const openResult = (result) => {
    if (!result) return;
    navigate(result.path, {
      state: result.state ? { ...result.state, globalSearchQuery: query } : { globalSearchQuery: query },
    });
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
    <div className="global-clinic-search" ref={wrapperRef}>
      <div className={`command-search-shell ${open ? "open" : ""}`}>
        <Search size={18} />
        <input
          ref={inputRef}
          aria-label="Global clinic search"
          className="command-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        <span className="command-search-hint">
          <Command size={14} />
          Ctrl K
        </span>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="overlay-panel command-search-panel"
            initial={{ opacity: 0, y: 12, scale: 0.988 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.988 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {!query.trim() ? (
              <div className="command-search-empty">
                <div className="command-search-empty-icon">
                  <Search size={18} />
                </div>
                <div>
                  <strong>Search across the full clinic ERP</strong>
                  <p>Find medicines, bills, purchases, people, alerts, reports, and pages in one place.</p>
                </div>
              </div>
            ) : loading ? (
              <LoadingSpinner label="Preparing clinic search..." />
            ) : groups.length ? (
              <div className="command-search-groups">
                {groups.map((group) => (
                  <div key={group.category} className="command-search-group">
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
                            <StatusBadge tone={toneMap[group.category]}>{group.category}</StatusBadge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No matching clinic records found"
                description="Try searching by medicine name, invoice number, supplier, phone, batch, alert, or page."
              />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default GlobalClinicSearch;
