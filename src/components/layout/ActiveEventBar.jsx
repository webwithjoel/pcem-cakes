import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, X } from 'lucide-react';
import { copy } from '../../data/copy.js';
import { formatDate } from '../../utils/format.js';
import { useEvents } from '../../context/EventContext.jsx';

export default function ActiveEventBar() {
  const { activeEvent, savedEvents, setActiveEvent, clearActiveEvent, storageWarning } = useEvents();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef(null);

  useEffect(() => {
    if (!switcherOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSwitcherOpen(false);
    };
    const closeOnOutsideClick = (event) => {
      if (!switcherRef.current?.contains(event.target)) setSwitcherOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('mousedown', closeOnOutsideClick);
    };
  }, [switcherOpen]);

  return (
    <>
      {activeEvent && (
        <div className="active-event-bar">
          <div className="active-event-content">
            <CalendarDays size={16} aria-hidden="true" />
            <p>
              <strong>{copy.activeEventBar.planning}:</strong>{' '}
              <span>{activeEvent.name}</span>
              <i>·</i>
              <span>{formatDate(activeEvent.date)}</span>
              <i>·</i>
              <span>{activeEvent.guests} {copy.activeEventBar.guests}</span>
            </p>
            <div className="event-switcher-anchor" ref={switcherRef}>
              <button
                type="button"
                className="event-bar-action"
                aria-expanded={switcherOpen}
                onClick={() => setSwitcherOpen((open) => !open)}
              >
                {copy.activeEventBar.change}
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                className="event-bar-action event-clear-action"
                onClick={() => {
                  clearActiveEvent();
                  setSwitcherOpen(false);
                }}
              >
                {copy.activeEventBar.clear}
                <X size={14} />
              </button>
              {switcherOpen && (
                <div className="event-switcher" role="dialog" aria-label={copy.activeEventBar.switchTitle}>
                  <strong>{copy.activeEventBar.switchTitle}</strong>
                  {savedEvents.map((event) => (
                    <button
                      type="button"
                      key={event.id}
                      aria-current={event.id === activeEvent.id ? 'true' : undefined}
                      onClick={() => {
                        setActiveEvent(event.id);
                        setSwitcherOpen(false);
                      }}
                    >
                      <span>{event.name}</span>
                      <small>{formatDate(event.date)} · {event.city}</small>
                    </button>
                  ))}
                  <button
                    className="switch-to-personal"
                    type="button"
                    onClick={() => {
                      clearActiveEvent();
                      setSwitcherOpen(false);
                    }}
                  >
                    {copy.activeEventBar.personal}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {storageWarning && (
        <p className="storage-warning" role="status">{storageWarning}</p>
      )}
    </>
  );
}
