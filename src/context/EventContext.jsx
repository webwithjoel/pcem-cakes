import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { deliveryCities } from '../data/delivery.js';
import { copy } from '../data/copy.js';
import { readStorage, writeStorage } from '../utils/storage.js';

const savedEventsKey = 'pcemcakes:saved-events';
const activeEventKey = 'pcemcakes:active-event';
const EventContext = createContext(null);

function isValidSavedEvent(event) {
  if (
    !event ||
    typeof event.id !== 'string' ||
    typeof event.name !== 'string' ||
    !event.name.trim() ||
    typeof event.date !== 'string' ||
    !Number.isInteger(event.guests) ||
    event.guests < 1 ||
    !deliveryCities.includes(event.city) ||
    !copy.eventForm.types.includes(event.type)
  ) {
    return false;
  }
  const [year, month, day] = event.date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(event.date) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day
  );
}

function createEventId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `event-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function validateEventDraft(draft) {
  const name = String(draft.name ?? '').trim();
  const type = String(draft.type ?? '');
  const date = String(draft.date ?? '');
  const guests = Number(draft.guests);
  const city = String(draft.city ?? '');
  if (!name) throw new RangeError('Enter an event name.');
  const [year, month, day] = date.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (!copy.eventForm.types.includes(type)) throw new RangeError('Choose an event type.');
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new RangeError('Choose a valid event date.');
  }
  if (!Number.isInteger(guests) || guests < 1) {
    throw new RangeError('Enter at least one guest.');
  }
  if (!deliveryCities.includes(city)) throw new RangeError('Choose a delivery city.');
  return { name, type, date, guests, city };
}

export function EventProvider({ children }) {
  const [initialState] = useState(() => {
    const eventResult = readStorage(savedEventsKey, []);
    const activeResult = readStorage(activeEventKey, null);
    const storedEvents = Array.isArray(eventResult.value)
      ? eventResult.value.filter(isValidSavedEvent)
      : [];
    if (!Array.isArray(eventResult.value)) {
      console.error('Saved events in localStorage are not a list.');
    } else if (storedEvents.length !== eventResult.value.length) {
      console.error('Invalid saved events in localStorage were ignored.');
    }
    return {
      savedEvents: storedEvents,
      activeEventId:
        storedEvents.some((event) => event.id === activeResult.value)
          ? activeResult.value
          : null,
      storageWarning:
        eventResult.error || activeResult.error
          ? copy.storage.eventWarning
          : '',
    };
  });
  const [savedEvents, setSavedEvents] = useState(initialState.savedEvents);
  const [activeEventId, setActiveEventId] = useState(initialState.activeEventId);
  const [storageWarning, setStorageWarning] = useState(initialState.storageWarning);

  useEffect(() => {
    const eventError = writeStorage(savedEventsKey, savedEvents);
    const activeError = writeStorage(activeEventKey, activeEventId);
    setStorageWarning(
      eventError || activeError
        ? copy.storage.eventWarning
        : '',
    );
  }, [savedEvents, activeEventId]);

  const activeEvent = savedEvents.find((event) => event.id === activeEventId) ?? null;

  const createEvent = (draft) => {
    const event = { id: createEventId(), ...validateEventDraft(draft) };
    setSavedEvents((events) => [...events, event]);
    setActiveEventId(event.id);
    return event;
  };

  const setActiveEvent = (id) => {
    if (id !== null && !savedEvents.some((event) => event.id === id)) {
      throw new RangeError('Choose one of your saved events.');
    }
    setActiveEventId(id);
  };

  const contextValue = useMemo(
    () => ({
      savedEvents,
      activeEvent,
      activeEventId,
      storageWarning,
      createEvent,
      setActiveEvent,
      clearActiveEvent: () => setActiveEvent(null),
    }),
    [savedEvents, activeEvent, activeEventId, storageWarning],
  );

  return <EventContext.Provider value={contextValue}>{children}</EventContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvents must be used within an EventProvider.');
  return context;
}
