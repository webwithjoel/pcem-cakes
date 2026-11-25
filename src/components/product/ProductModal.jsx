import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, CakeSlice, Check, Minus, Plus, X } from 'lucide-react';
import { copy } from '../../data/copy.js';
import { modalConfigs } from '../../data/modalConfigs.js';
import { cakeSizePrices } from '../../data/prices.js';
import { useEvents } from '../../context/EventContext.jsx';
import { bulkDiscount, bulkQuantityFor, deliveryFor, priceFor } from '../../utils/pricing.js';
import { dateAfterDays, formatDate, formatNaira } from '../../utils/format.js';
import EventForm from './EventForm.jsx';

const defaultSmallChops = ['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll', 'Puff-puff'];

function optionPriceText(field, option, productId) {
  if (!option.price) return null;
  const directPrice = ['boxSize', 'tiers'].includes(field.name) ||
    (field.name === 'size' && productId === 'engagement-pillow-cake');
  if (field.name === 'size' && ['drip-birthday-cake', 'gold-streak-cake', 'custom-celebration-cake'].includes(productId)) {
    return `From ${formatNaira(option.price)}`;
  }
  return directPrice ? formatNaira(option.price) : `+${formatNaira(option.price)}`;
}

function maxSelections(field, values) {
  if (!field.maxSelectedBy) return field.maxSelected ?? field.options.length;
  if (field.maxSelectedBy.field === 'layers') {
    return values.layers > field.maxSelectedBy.above
      ? field.maxSelectedBy.value
      : field.maxSelectedBy.otherwise;
  }
  return field.maxSelectedBy.values?.[values[field.maxSelectedBy.field]] ?? field.options.length;
}

function FieldHint({ children }) {
  return <small className="modal-field-hint">{children}</small>;
}

function ProductField({ field, value, values, productId, onChange, onFileSelect, fileError }) {
  const maxSelected = field.type === 'multiChips' ? maxSelections(field, values) : 0;
  const labelId = `${productId}-${field.name}-label`;
  let fieldOptions = field.options;
  if (field.name === 'layers' && cakeSizePrices[values.size]) {
    fieldOptions = fieldOptions.filter((option) => Object.hasOwn(cakeSizePrices[values.size], option.value));
  }

  const renderPrice = (option) => {
    const text = optionPriceText(field, option, productId);
    return text ? <small className="field-option-price">{text}</small> : null;
  };

  const renderChoiceButtons = (multiple = false) => {
    const selected = multiple ? (Array.isArray(value) ? value : []) : [value];
    return (
      <div className={field.type === 'segmented' ? 'modal-segmented' : 'modal-choice-grid'} role="group" aria-labelledby={labelId}>
        {fieldOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled = multiple && !isSelected && selected.length >= maxSelected;
          return (
            <button
              className={`modal-choice${isSelected ? ' modal-choice-selected' : ''}`}
              type="button"
              key={option.value}
              aria-pressed={isSelected}
              disabled={isDisabled}
              onClick={() => {
                if (!multiple) {
                  onChange(option.value);
                } else if (isSelected) {
                  if (maxSelected > fieldOptions.length && selected.length < maxSelected) {
                    onChange([...selected, option.value]);
                  } else {
                    const selectedIndex = selected.indexOf(option.value);
                    onChange(selected.filter((_, index) => index !== selectedIndex));
                  }
                } else {
                  onChange([...selected, option.value]);
                }
              }}
            >
              <span>{option.label}</span>
              {renderPrice(option)}
            </button>
          );
        })}
      </div>
    );
  };

  const renderSelect = () => {
    if (!field.perTier) {
      return (
        <select aria-label={field.label} value={value} onChange={(event) => onChange(event.target.value)}>
          {fieldOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}{option.price ? ` · ${formatNaira(option.price)}` : ''}
            </option>
          ))}
        </select>
      );
    }

    const tierCount = String(values.tiers).startsWith('3 tier') ? 3 : 2;
    const tierValues = Array.isArray(value) ? value : [];
    return (
      <div className="per-tier-selects">
        {Array.from({ length: tierCount }, (_, index) => (
          <div className="per-tier-select" key={index}>
            <span>Tier {index + 1}</span>
            <select
              aria-label={`Tier ${index + 1} ${field.label}`}
              value={tierValues[index] ?? 'Vanilla'}
              onChange={(event) => {
                const nextValues = Array.from({ length: tierCount }, (__, tier) => tierValues[tier] ?? 'Vanilla');
                nextValues[index] = event.target.value;
                onChange(nextValues);
              }}
            >
              {fieldOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}{option.price ? ` · +${formatNaira(option.price)}` : ''}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  };

  const renderCounterGroup = () => {
    const counts = value ?? {};
    return (
      <div className="counter-option-list">
        {fieldOptions.map((option) => {
          const count = counts[option.value] ?? 0;
          return (
            <div className="counter-option" key={option.value}>
              <span>
                <strong>{option.label}</strong>
                <small>{option.price ? `+${formatNaira(option.price)} each` : 'Included'}</small>
              </span>
              <div className="quantity-control">
                <button
                  type="button"
                  aria-label={`Decrease ${option.label}`}
                  disabled={count <= 0}
                  onClick={() => onChange({ ...counts, [option.value]: count - 1 })}
                >
                  <Minus size={15} />
                </button>
                <output aria-label={`${option.label} quantity`}>{count}</output>
                <button
                  type="button"
                  aria-label={`Increase ${option.label}`}
                  disabled={count >= option.maxQty}
                  onClick={() => onChange({ ...counts, [option.value]: count + 1 })}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderField = () => {
    if (field.type === 'segmented') return renderChoiceButtons();
    if (field.type === 'chips') return renderChoiceButtons();
    if (field.type === 'multiChips') return renderChoiceButtons(true);
    if (field.type === 'select') return renderSelect();
    if (field.type === 'counter' && field.options) return renderCounterGroup();
    if (field.type === 'counter') {
      return (
        <input
          aria-label={field.label}
          type="number"
          min={field.min ?? 0}
          max={field.max}
          step={field.step ?? 1}
          value={value}
          onChange={(event) => onChange(event.target.value === '' ? '' : Number(event.target.value))}
        />
      );
    }
    if (field.type === 'text') {
      return (
        <input
          aria-label={field.label}
          type="text"
          value={value ?? ''}
          maxLength={field.maxLength}
          placeholder={field.placeholder ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }
    if (field.type === 'textarea') {
      return (
        <textarea
          aria-label={field.label}
          value={value ?? ''}
          rows="3"
          placeholder={field.placeholder ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }
    if (field.type === 'date') {
      const minimum = dateAfterDays(field.leadTimeDays);
      return (
        <input
          aria-label={field.label}
          type={field.includeTime ? 'datetime-local' : 'date'}
          min={field.includeTime ? `${minimum}T00:00` : minimum}
          required
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }
    if (field.type === 'file') {
      return (
        <div className="inspiration-upload">
          <input
            type="file"
            accept="image/*"
            aria-label={field.label}
            onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          />
          {value?.thumbnail && (
            <div className="inspiration-preview">
              <img src={value.thumbnail} alt={`Thumbnail of ${value.name}`} />
              <span>{value.name}</span>
              <button type="button" onClick={() => onFileSelect(null)}>Remove</button>
            </div>
          )}
          {fileError && <span className="field-error" role="alert">{fileError}</span>}
        </div>
      );
    }
    throw new RangeError(`Unsupported product field type "${field.type}".`);
  };

  const showSupportingVisual = ['finish', 'finishes', 'topper'].includes(field.name);
  const supportingValue = Array.isArray(value) ? value[0] : value;
  const supportingImage =
    field.supportingImages?.[supportingValue] ?? field.supportingImage;
  const supportingCaption =
    field.supportingCaption ??
    (field.name === 'topper'
      ? 'A small finishing touch for your cake.'
      : 'A little inspiration for your finish.');

  return (
    <div className="modal-field">
      <span className="modal-field-label" id={labelId}>{field.label}</span>
      {renderField()}
      {showSupportingVisual && (
        <div className="field-supporting-visual">
          {supportingImage
            ? <img src={supportingImage} alt={`Example ${field.label.toLowerCase()}`} />
            : <CakeSlice size={30} strokeWidth={1.3} aria-hidden="true" />}
          <span>{supportingCaption}</span>
        </div>
      )}
      <FieldHint>{field.hint}</FieldHint>
    </div>
  );
}

function makeThumbnail(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(copy.modal.inspirationReadError));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error(copy.modal.inspirationReadError));
      image.onload = () => {
        const scale = Math.min(120 / image.width, 120 / image.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error(copy.modal.inspirationReadError));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve({ name: file.name, thumbnail: canvas.toDataURL('image/jpeg', 0.75) });
      };
      if (typeof reader.result !== 'string') {
        reject(new Error(copy.modal.inspirationReadError));
        return;
      }
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProductModal({ product, initialQuantity = 1, onClose, onAdd }) {
  const config = modalConfigs[product.id];
  if (!config) throw new RangeError(`No customisation config exists for "${product.id}".`);

  const {
    activeEvent,
    savedEvents,
    createEvent,
    setActiveEvent,
  } = useEvents();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [options, setOptions] = useState(() => {
    const defaults = JSON.parse(JSON.stringify(config.defaultOptions));
    if (activeEvent && !defaults.neededDate) defaults.neededDate = `${activeEvent.date}T12:00`;
    return defaults;
  });
  const [quantity, setQuantity] = useState(() =>
    Math.max(config.minimumQuantity ?? 1, initialQuantity, config.defaultQuantity ?? 1),
  );
  const [orderingMode, setOrderingMode] = useState(() =>
    activeEvent ? 'saved' : config.requiresEvent ? 'new' : 'personal',
  );
  const [selectedEventId, setSelectedEventId] = useState(activeEvent?.id ?? '');
  const [step, setStep] = useState(
    config.requiresEvent ? 1 : activeEvent ? 2 : 0,
  );
  const [eventDraft, setEventDraft] = useState({
    name: '',
    type: product.id === 'two-tier-wedding-cake' ? 'Wedding' : 'Birthday',
    date: '',
    guests: '',
    city: '',
  });
  const [formError, setFormError] = useState('');
  const [photoError, setPhotoError] = useState('');

  onCloseRef.current = onClose;
  const selectedEvent = orderingMode === 'saved'
    ? savedEvents.find((event) => event.id === selectedEventId) ?? null
    : null;
  const hasEventFlow = config.requiresEvent || orderingMode !== 'personal';
  const minimumQuantity = config.minimumQuantityByItem?.[options.itemType] ?? config.minimumQuantity ?? 1;
  const normalizedQuantity = Math.max(minimumQuantity, Number(quantity) || minimumQuantity);
  const minimumDate = dateAfterDays(config.leadTimeDays);
  const neededDate = options.neededDate?.slice(0, 10) ?? '';
  const dateIsValid = Boolean(neededDate && neededDate >= minimumDate);
  const selectedEventMeetsLeadTime = Boolean(selectedEvent && selectedEvent.date >= minimumDate);

  const price = useMemo(() => {
    try {
      const subtotal = priceFor(product.id, options, normalizedQuantity);
      const discountCount = bulkQuantityFor(product.id, options, normalizedQuantity);
      const discount = bulkDiscount(product.id, discountCount, subtotal);
      const delivery = selectedEvent
        ? deliveryFor(selectedEvent.city, {
            guests: selectedEvent.guests,
            items: [{ productId: product.id, options }],
          })
        : null;
      return {
        subtotal,
        discount,
        delivery,
        total: subtotal - discount.amount + (delivery?.fee ?? 0),
        error: '',
      };
    } catch (error) {
      if (!(error instanceof RangeError) && !(error instanceof TypeError)) throw error;
      return { subtotal: null, discount: null, delivery: null, total: null, error: error.message };
    }
  }, [product.id, options, normalizedQuantity, selectedEvent]);

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add('modal-open');
    closeButtonRef.current?.focus();
    const trapFocusAndEscape = (event) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trapFocusAndEscape);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', trapFocusAndEscape);
      previousFocus?.focus?.();
    };
  }, []);

  const updateOption = (field, value) => {
    if (field.name === 'itemType') {
      const nextMinimum = config.minimumQuantityByItem?.[value] ?? minimumQuantity;
      setQuantity((current) => Math.max(nextMinimum, Number(current) || nextMinimum));
    }

    setOptions((current) => {
      const next = { ...current, [field.name]: value };
      if (field.name === 'size' && product.id === 'small-chops-tray') {
        const count = field.maxSelectedBy?.values?.[value] ?? 3;
        const items = [...(current.items ?? [])];
        while (items.length < count) items.push(defaultSmallChops[items.length]);
        next.items = items.slice(0, count);
      }
      if (field.name === 'size' && cakeSizePrices[value]) {
        const availableLayers = Object.keys(cakeSizePrices[value]).map(Number);
        if (!availableLayers.includes(Number(current.layers))) {
          next.layers = availableLayers[0];
        }
      }
      if (field.name === 'layers' && Array.isArray(current.flavours)) {
        const maxFlavours = Number(value) > 1 ? 2 : 1;
        next.flavours = current.flavours.slice(0, maxFlavours);
      }
      if (field.name === 'tiers') {
        const count = String(value).startsWith('3 tier') ? 3 : 2;
        next.tierFlavours = Array.from(
          { length: count },
          (_, index) => current.tierFlavours?.[index] ?? 'Vanilla',
        );
      }
      return next;
    });
  };

  const selectOrderingMode = (mode) => {
    if (config.requiresEvent && mode === 'personal') return;
    setOrderingMode(mode);
    setStep(mode === 'personal' ? 0 : 1);
    setFormError('');
    if (mode === 'saved' && activeEvent) setSelectedEventId(activeEvent.id);
  };

  const saveNewEvent = () => {
    try {
      const event = createEvent(eventDraft);
      setSelectedEventId(event.id);
      setOrderingMode('saved');
      setOptions((current) => ({ ...current, neededDate: `${event.date}T12:00` }));
      setStep(2);
      setFormError('');
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      setFormError(error.message);
    }
  };

  const continueFromEvent = () => {
    if (!selectedEvent) {
      setFormError('Choose one of your saved events.');
      return;
    }
    if (selectedEvent.date < minimumDate) {
      setFormError(copy.modal.missingDate);
      return;
    }
    setActiveEvent(selectedEvent.id);
    setOptions((current) => ({ ...current, neededDate: `${selectedEvent.date}T12:00` }));
    setFormError('');
    setStep(2);
  };

  const continueFromOptions = () => {
    if (!dateIsValid) {
      setFormError(copy.modal.missingDate);
      return;
    }
    if (price.error) {
      setFormError(price.error);
      return;
    }
    setFormError('');
    setStep(hasEventFlow ? 3 : 0);
  };

  const addProduct = () => {
    if (!dateIsValid || price.error || (config.requiresEvent && !selectedEvent)) {
      setFormError(price.error || copy.modal.missingDate);
      return;
    }
    onAdd(product, normalizedQuantity, options, {
      groupId: selectedEvent?.id ?? 'personal',
      event: selectedEvent,
    });
  };

  const handleFileSelect = async (file) => {
    setPhotoError('');
    if (!file) {
      setOptions((current) => ({ ...current, inspirationPhoto: null }));
      return;
    }
    if (!file.type.startsWith('image/')) {
      setPhotoError(copy.modal.inspirationTooLarge);
      return;
    }
    try {
      const thumbnail = await makeThumbnail(file);
      setOptions((current) => ({ ...current, inspirationPhoto: thumbnail }));
    } catch (error) {
      console.error('Unable to create an inspiration photo thumbnail.', error);
      setPhotoError(error.message);
    }
  };

  const showEventStep = hasEventFlow && step === 1;
  const showOptions = !hasEventFlow || step === 2;
  const showReview = hasEventFlow && step === 3;

  const getFieldValue = (field) => {
    if (field.name === 'extras') return options.extras;
    return options[field.name];
  };

  const summaryValue = (field) => {
    const value = getFieldValue(field);
    if (field.type === 'file') return value?.name ?? '';
    if (field.type === 'counter') {
      return Object.entries(value ?? {})
        .filter(([, count]) => count > 0)
        .map(([key, count]) => {
          const option = field.options.find((item) => item.value === key);
          return `${option?.label ?? key} × ${count}`;
        })
        .join(', ');
    }
    if (Array.isArray(value)) return value.join(', ');
    if (field.name === 'neededDate' && value) return formatDate(value.slice(0, 10));
    return value ?? '';
  };

  const mainAction = () => {
    if (showEventStep) {
      if (orderingMode === 'new') return null;
      return continueFromEvent();
    }
    if (showOptions) return hasEventFlow ? continueFromOptions() : addProduct();
    if (showReview) return addProduct();
    return addProduct();
  };

  const actionLabel = showEventStep
    ? copy.modal.continue
    : showOptions && hasEventFlow
      ? copy.modal.review
      : copy.modal.addToCart;

  const canContinue =
    (!showEventStep || orderingMode === 'new' || selectedEventMeetsLeadTime) &&
    (!showOptions || (dateIsValid && !price.error)) &&
    (showReview ? dateIsValid && !price.error : true);

  return (
    <div
      className="product-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="product-modal-title"
        aria-modal="true"
        className="product-modal"
        ref={dialogRef}
        role="dialog"
      >
        <div className="product-modal-heading">
          <div>
            <span className="section-kicker">Make it yours</span>
            <h2 id="product-modal-title">{product.name}</h2>
          </div>
          <button
            className="icon-button modal-close"
            type="button"
            ref={closeButtonRef}
            aria-label={copy.modal.close}
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        <div className="ordering-control">
          <span>{copy.modal.orderingLabel}</span>
          <div className="ordering-segmented" role="group" aria-label={copy.modal.orderingLabel}>
            {copy.modal.orderingModes.map((mode) => (
              <button
                type="button"
                key={mode.id}
                aria-pressed={orderingMode === mode.id}
                aria-disabled={config.requiresEvent && mode.id === 'personal' ? 'true' : undefined}
                className={orderingMode === mode.id ? 'ordering-option ordering-option-active' : 'ordering-option'}
                onClick={() => selectOrderingMode(mode.id)}
              >
                {mode.label}
              </button>
            ))}
          </div>
          {config.requiresEvent && <small>{copy.modal.weddingRequiresEvent}</small>}
        </div>

        {hasEventFlow && (
          <div className="modal-progress" aria-label="Order steps">
            {copy.modal.steps.map((label, index) => {
              const stepNumber = index + 1;
              return (
                <div className={step >= stepNumber ? 'modal-progress-step modal-progress-active' : 'modal-progress-step'} key={label}>
                  <span>{step > stepNumber ? <Check size={14} /> : stepNumber}</span>
                  <small>{label}</small>
                </div>
              );
            })}
          </div>
        )}

        <div className="product-modal-body">
          {showEventStep && (
            <section className="modal-step-section" aria-label={copy.modal.steps[0]}>
              {orderingMode === 'new' ? (
                <EventForm
                  value={eventDraft}
                  onChange={setEventDraft}
                  onSubmit={saveNewEvent}
                  submitLabel={copy.modal.saveEvent}
                  leadTimeDays={config.leadTimeDays}
                  error={formError}
                />
              ) : (
                <div className="saved-event-selection">
                  <label className="modal-field">
                    <span>{copy.modal.savedEventLabel}</span>
                    <select
                      value={selectedEventId}
                      onChange={(event) => {
                        setSelectedEventId(event.target.value);
                        setFormError('');
                      }}
                    >
                      <option value="">{copy.modal.savedEventPlaceholder}</option>
                      {savedEvents.map((event) => (
                        <option value={event.id} key={event.id}>
                          {event.name} · {formatDate(event.date)} · {event.city}
                        </option>
                      ))}
                    </select>
                    <FieldHint>{copy.eventForm.city.hint}</FieldHint>
                  </label>
                  {savedEvents.length === 0 && (
                    <div className="modal-empty-events">
                      <p>{copy.modal.noSavedEvents}</p>
                      <button type="button" className="text-link" onClick={() => selectOrderingMode('new')}>
                        {copy.modal.createEvent} <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                  {selectedEvent && (
                    <div className="selected-event-summary">
                      <strong>{selectedEvent.name}</strong>
                      <span>{selectedEvent.type} · {formatDate(selectedEvent.date)}</span>
                      <span>{selectedEvent.guests} {copy.activeEventBar.guests} · {selectedEvent.city}</span>
                    </div>
                  )}
                  {selectedEvent && !selectedEventMeetsLeadTime && (
                    <p className="event-form-error" role="alert">{copy.modal.missingDate}</p>
                  )}
                  {formError && <p className="event-form-error" role="alert">{formError}</p>}
                </div>
              )}
            </section>
          )}

          {showOptions && (
            <>
              <div className="modal-quantity">
                <div>
                  <strong>{copy.modal.quantity}</strong>
                  <small>{config.minimumQuantity ? `Minimum order: ${minimumQuantity}` : 'Choose how many to order.'}</small>
                </div>
                <div className="quantity-control">
                  <button
                    type="button"
                    aria-label="Decrease order quantity"
                    disabled={normalizedQuantity <= minimumQuantity}
                    onClick={() => setQuantity((current) => Math.max(minimumQuantity, Number(current) - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    aria-label={copy.modal.quantity}
                    type="number"
                    min={minimumQuantity}
                    step="1"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    onBlur={() => setQuantity(String(normalizedQuantity))}
                  />
                  <button type="button" aria-label="Increase order quantity" onClick={() => setQuantity(normalizedQuantity + 1)}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="modal-fields">
                {config.fields.map((field) => (
                  <ProductField
                    key={field.name}
                    field={field}
                    value={getFieldValue(field)}
                    values={options}
                    productId={product.id}
                    onChange={(value) => updateOption(field, value)}
                    onFileSelect={handleFileSelect}
                    fileError={field.name === 'inspirationPhoto' ? photoError : ''}
                  />
                ))}
              </div>
              {price.error && (
                <p className="modal-pricing-error" role="alert">{price.error}</p>
              )}
              {formError && <p className="event-form-error" role="alert">{formError}</p>}
            </>
          )}

          {showReview && (
            <section className="modal-review" aria-label={copy.modal.steps[2]}>
              <h3>{copy.modal.eventSummary}</h3>
              <dl className="review-detail-list">
                <div><dt>{copy.modal.eventName}</dt><dd>{selectedEvent?.name}</dd></div>
                <div><dt>{copy.modal.eventDate}</dt><dd>{selectedEvent ? formatDate(selectedEvent.date) : ''}</dd></div>
                <div><dt>{copy.modal.eventGuests}</dt><dd>{selectedEvent?.guests}</dd></div>
                <div><dt>{copy.modal.eventCity}</dt><dd>{selectedEvent?.city}</dd></div>
              </dl>
              <h3>{copy.modal.optionsSummary}</h3>
              <dl className="review-detail-list">
                <div><dt>{copy.modal.quantity}</dt><dd>{normalizedQuantity} × {product.name}</dd></div>
                {config.fields.map((field) => {
                  const value = summaryValue(field);
                  return value ? <div key={field.name}><dt>{field.label}</dt><dd>{value}</dd></div> : null;
                })}
              </dl>
              {options.notes && (
                <p className="review-note-text"><strong>{copy.modal.notesSummary}:</strong> {options.notes}</p>
              )}
              <div className="modal-delivery-review">
                <span>{copy.modal.estimatedDelivery}</span>
                <strong>{price.delivery ? formatNaira(price.delivery.fee) : copy.modal.deliveryInCart}</strong>
              </div>
            </section>
          )}
        </div>

        <div className="product-modal-footer">
          {price.discount?.amount > 0 && (
            <p className="modal-bulk-line">{copy.modal.bulkApplied}: −{formatNaira(price.discount.amount)}</p>
          )}
          {price.discount?.hint && (
            <p className="bulk-discount-hint">{price.discount.hint}</p>
          )}
          <div className="modal-price-row">
            <div>
              <span>{copy.modal.estimatedTotal}</span>
              <strong>{price.total === null ? '—' : formatNaira(price.total)}</strong>
              {price.delivery && <small>{copy.modal.estimatedDelivery} included</small>}
            </div>
            <div className="modal-footer-actions">
              {step > 1 && hasEventFlow && step < 3 && (
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => {
                    setStep(step - 1);
                    setFormError('');
                  }}
                >
                  <ArrowLeft size={16} />
                  {copy.modal.back}
                </button>
              )}
              <button
                className="button button-pink modal-main-action"
                type="button"
                disabled={!canContinue || (showEventStep && orderingMode === 'new')}
                onClick={mainAction}
              >
                {showReview ? copy.modal.addToCart : actionLabel}
                {showReview || !hasEventFlow ? <Check size={17} /> : <ArrowRight size={17} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
