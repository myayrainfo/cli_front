import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  CircleAlert,
  CircleDot,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLayoutData } from "../layouts/LayoutDataContext";
import { buildNotifications } from "../utils/notifications";
import EmptyState from "./EmptyState";
import StatusBadge from "./StatusBadge";

const READ_KEY = "arya_notifications_read";
const ARCHIVED_KEY = "arya_notifications_archived";

const safeParse = (value) => {
  try {
    return JSON.parse(value || "[]");
  } catch (_error) {
    return [];
  }
};

const typeMeta = {
  critical: {
    icon: CircleAlert,
    tone: "danger",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    tone: "warning",
    label: "Warning",
  },
  info: {
    icon: CircleDot,
    tone: "info",
    label: "Info",
  },
};

const NotificationsMenu = ({ badgeCountOverride }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const { shellData } = useLayoutData();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => safeParse(localStorage.getItem(READ_KEY)));
  const [archivedIds, setArchivedIds] = useState(() => safeParse(localStorage.getItem(ARCHIVED_KEY)));

  const notifications = useMemo(() => buildNotifications(shellData), [shellData]);

  useEffect(() => {
    localStorage.setItem(READ_KEY, JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem(ARCHIVED_KEY, JSON.stringify(archivedIds));
  }, [archivedIds]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const visibleNotifications = notifications
    .filter((item) => !archivedIds.includes(item.id))
    .map((item) => ({
      ...item,
      read: readIds.includes(item.id),
    }));

  const unreadCount = visibleNotifications.filter((item) => !item.read).length;
  const badgeCount = Math.max(unreadCount, badgeCountOverride || 0);

  const groupedNotifications = ["critical", "warning", "info"]
    .map((type) => ({
      type,
      label: typeMeta[type].label,
      items: visibleNotifications.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length);

  const markAsRead = (id) => {
    setReadIds((current) => (current.includes(id) ? current : [...current, id]));
  };

  const markAllAsRead = () => {
    setReadIds(visibleNotifications.map((item) => item.id));
  };

  const clearReadNotifications = () => {
    setArchivedIds((current) => [
      ...new Set([...current, ...visibleNotifications.filter((item) => item.read).map((item) => item.id)]),
    ]);
  };

  const openNotification = (notification) => {
    markAsRead(notification.id);
    navigate(notification.path);
    setOpen(false);
  };

  return (
    <div className="notifications-menu" ref={wrapperRef}>
      <button
        type="button"
        className="icon-button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open notifications"
      >
        <Bell size={18} />
        {badgeCount ? <span className="notification-count">{badgeCount}</span> : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="overlay-panel notifications-panel"
            initial={{ opacity: 0, y: 10, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="notifications-panel-head">
              <div className="notifications-head">
                <div>
                  <strong>Notifications</strong>
                  <p>{unreadCount} unread updates</p>
                </div>
                <div className="notifications-actions">
                  <button type="button" className="icon-button subtle" onClick={markAllAsRead} aria-label="Mark all as read">
                    <CheckCheck size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button subtle"
                    onClick={clearReadNotifications}
                    aria-label="Clear read notifications"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="notifications-toolbar">
                <StatusBadge tone="info">{visibleNotifications.length} total</StatusBadge>
                {unreadCount ? (
                  <StatusBadge tone="warning">{unreadCount} unread</StatusBadge>
                ) : (
                  <StatusBadge tone="success">All caught up</StatusBadge>
                )}
              </div>
            </div>

            <div className="notifications-panel-body">
              {groupedNotifications.length ? (
                <div className="notifications-groups">
                  {groupedNotifications.map((group) => (
                    <div key={group.type} className="notification-group">
                      <div className="search-group-head">
                        <span>{group.label}</span>
                        <StatusBadge tone={typeMeta[group.type].tone}>{group.items.length}</StatusBadge>
                      </div>
                      <div className="notification-list">
                        {group.items.map((notification) => {
                          const Icon = typeMeta[notification.type].icon;
                          return (
                            <div
                              key={notification.id}
                              className={`notification-item ${notification.read ? "read" : "unread"}`}
                            >
                              <button
                                type="button"
                                className="notification-main"
                                onClick={() => openNotification(notification)}
                              >
                                <span className={`notification-icon tone-${notification.type}`}>
                                  <Icon size={16} />
                                </span>
                                <span className="notification-copy">
                                  <strong>{notification.title}</strong>
                                  <span>{notification.message}</span>
                                </span>
                              </button>
                              <button
                                type="button"
                                className="text-button notification-link"
                                onClick={() => openNotification(notification)}
                              >
                                View related page
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No notifications"
                  description="Stock, dues, follow-ups, and sales updates will appear here."
                />
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsMenu;
