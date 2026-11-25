import React, { useEffect, useState } from 'react';
import { ArrowRight, CakeSlice, CupSoda, Plus, Utensils } from 'lucide-react';
import { copy } from '../../data/copy.js';
import { deliveryCities } from '../../data/delivery.js';
import { products } from '../../data/products.js';
import { deliveryFor, priceFor } from '../../utils/pricing.js';
import { dateAfterDays, formatDate, formatNaira } from '../../utils/format.js';
import { useEvents } from '../../context/EventContext.jsx';
import EventForm from '../product/EventForm.jsx';

const cakeProduct = products.find((product) => product.id === 'custom-celebration-cake');
const trayProduct = products.find((product) => product.id === 'small-chops-tray');
const cupcakeProduct = products.find((product) => product.id === 'cupcake-box');

function getSuggestions(guestCount, eventDate, eventType) {
  const guests = Number(guestCount);
  if (!Number.isInteger(guests) || guests < 1) return [];

  const trayCount = Math.ceil(guests / 15);
  const cupcakeBoxes = Math.ceil(guests / 12);
  const neededDate = `${eventDate}T12:00`;
  let cakeSuggestion;

  if (eventType === 'Wedding') {
    const product = products.find((item) => item.id === 'two-tier-wedding-cake');
    cakeSuggestion = {
      id: product.id,
      product,
      title: copy.eventPlanner.weddingCakeSuggestion,
      detail: '2 tiers · 8″ + 6″',
      icon: CakeSlice,
      quantity: 1,
      options: {
        tiers: '2 tier (8″ + 6″)',
        tierFlavours: ['Vanilla', 'Vanilla'],
        finishes: ['Buttercream'],
        extras: { cakeStandHire: 0, cuttingKnifeAndServerSet: 0, cakeTopper: 0 },
        neededDate,
        notes: '',
      },
    };
  } else if (eventType === 'Engagement') {
    const product = products.find((item) => item.id === 'engagement-pillow-cake');
    cakeSuggestion = {
      id: product.id,
      product,
      title: copy.eventPlanner.engagementCakeSuggestion,
      detail: 'Standard pillow cake',
      icon: CakeSlice,
      quantity: 1,
      options: {
        size: 'Standard',
        flavour: 'Vanilla',
        trimColour: 'Red and gold',
        extras: { personalisedNameBoard: 0, goldCakeBoard: 0 },
        neededDate,
        notes: '',
      },
    };
  } else {
    const cakeSize = guests <= 15 ? '6″' : guests <= 30 ? '8″' : guests <= 60 ? '10″' : '12″';
    const cakeLayers = cakeSize === '6″' || cakeSize === '8″' ? 2 : 3;
    cakeSuggestion = {
      id: cakeProduct.id,
      product: cakeProduct,
      title: copy.eventPlanner.cakeSuggestion,
      detail: `${cakeSize} · ${cakeLayers} layers`,
      icon: CakeSlice,
      quantity: 1,
      options: {
        size: cakeSize,
        layers: cakeLayers,
        flavours: ['Vanilla'],
        finish: 'Plain butter icing',
        topper: 'None',
        extras: { numberCandles: 0, sparklers: 0, goldCakeBoard: 0 },
        textOnCake: '',
        colourTheme: '',
        neededDate,
        notes: '',
      },
    };
  }

  return [
    cakeSuggestion,
    {
      id: 'small-chops-tray',
      product: trayProduct,
      title: copy.eventPlanner.traySuggestion,
      detail: `${trayCount} × Large tray${trayCount === 1 ? '' : 's'}`,
      icon: Utensils,
      quantity: trayCount,
      options: {
        size: 'Large',
        items: ['Puff-puff', 'Samosa', 'Spring roll', 'Sausage roll', 'Puff-puff'],
        extras: { pepperedChicken: 0, pepperedGizzard: 0, cucumberAndDip: 0 },
        neededDate,
        notes: '',
      },
    },
    {
      id: 'cupcake-box',
      product: cupcakeProduct,
      title: copy.eventPlanner.cupcakeSuggestion,
      detail: `${cupcakeBoxes} box${cupcakeBoxes === 1 ? '' : 'es'} of 12`,
      icon: CupSoda,
      quantity: cupcakeBoxes,
      options: {
        boxSize: 12,
        flavour: 'Vanilla',
        colourTheme: '',
        toppingStyle: 'Swirl',
        neededDate,
        notes: '',
      },
    },
  ].map((suggestion) => ({
    ...suggestion,
    subtotal: priceFor(suggestion.product.id, suggestion.options, suggestion.quantity),
  }));
}

export default function EventPlanner({ onAdd }) {
  const { activeEvent, createEvent } = useEvents();
  const [eventDraft, setEventDraft] = useState({
    name: '',
    type: 'Birthday',
    date: '',
    guests: '',
    city: '',
  });
  const [plannedEvent, setPlannedEvent] = useState(activeEvent);
  const [error, setError] = useState('');

  useEffect(() => {
    setPlannedEvent(activeEvent);
  }, [activeEvent]);

  const suggestionEvent = plannedEvent ?? eventDraft;
  const suggestionLeadTime =
    suggestionEvent.type === 'Wedding' || suggestionEvent.type === 'Engagement' ? 7 : 3;
  const hasLeadTime = plannedEvent
    ? plannedEvent.date >= dateAfterDays(suggestionLeadTime)
    : !eventDraft.date || eventDraft.date >= dateAfterDays(suggestionLeadTime);
  const suggestionDate = suggestionEvent.date || dateAfterDays(suggestionLeadTime);
  const suggestions = hasLeadTime
    ? getSuggestions(suggestionEvent.guests, suggestionDate, suggestionEvent.type)
    : [];
  const delivery = suggestions.length && deliveryCities.includes(suggestionEvent.city)
    ? deliveryFor(suggestionEvent.city, {
        guests: suggestionEvent.guests,
        items: suggestions.map(({ product, options }) => ({ productId: product.id, options })),
      })
    : null;
  const estimate = suggestions.reduce((sum, item) => sum + item.subtotal, 0) + (delivery?.fee ?? 0);

  const saveEvent = () => {
    try {
      const requiredLeadTime = eventDraft.type === 'Wedding' || eventDraft.type === 'Engagement' ? 7 : 3;
      if (eventDraft.date < dateAfterDays(requiredLeadTime)) {
        throw new RangeError(copy.modal.missingDate);
      }
      const event = createEvent(eventDraft);
      setPlannedEvent(event);
      setError('');
    } catch (caughtError) {
      if (!(caughtError instanceof RangeError)) throw caughtError;
      setError(caughtError.message);
    }
  };

  const addSuggestion = (suggestion) => {
    if (!plannedEvent) return;
    onAdd(suggestion.product, suggestion.quantity, suggestion.options, {
      groupId: plannedEvent.id,
      event: plannedEvent,
    });
  };

  const addAllSuggestions = () => {
    suggestions.forEach(addSuggestion);
  };

  return (
    <section className="event-planner-section" id="event-planner" aria-labelledby="event-planner-title">
      <div className="event-planner-wrap">
        <div className="event-planner-intro">
          <span className="section-kicker">{copy.eventPlanner.kicker}</span>
          <h2 id="event-planner-title">{copy.eventPlanner.title}</h2>
          <p>{copy.eventPlanner.description}</p>
        </div>

        <div className="event-planner-card">
          {plannedEvent ? (
            <div className="planner-event-summary">
              <div>
                <span className="planner-summary-label">{copy.activeEventBar.planning}</span>
                <h3>{plannedEvent.name}</h3>
                <p>{plannedEvent.type} · {formatDate(plannedEvent.date)} · {plannedEvent.guests} {copy.activeEventBar.guests} · {plannedEvent.city}</p>
              </div>
              <button
                className="button button-outline planner-change-event"
                type="button"
                onClick={() => {
                  setPlannedEvent(null);
                  setEventDraft({ name: '', type: 'Birthday', date: '', guests: '', city: '' });
                  setError('');
                }}
              >
                Plan another event
              </button>
            </div>
          ) : (
            <>
              <div className="planner-form-heading">
                <h3>{copy.eventPlanner.formTitle}</h3>
                <p>{copy.eventPlanner.formDescription}</p>
              </div>
              <EventForm
                value={eventDraft}
                onChange={setEventDraft}
                onSubmit={saveEvent}
                submitLabel={copy.eventPlanner.saveEvent}
                leadTimeDays={eventDraft.type === 'Wedding' || eventDraft.type === 'Engagement' ? 7 : 3}
                error={error}
              />
            </>
          )}

          {suggestions.length > 0 ? (
            <div className="planner-suggestions">
              <div className="planner-suggestions-heading">
                <div>
                  <span className="section-kicker">{copy.eventPlanner.suggestionTitle}</span>
                  <p>{copy.eventPlanner.suggestionDisclaimer}</p>
                </div>
              </div>
              <div className="planner-suggestion-grid">
                {suggestions.map((suggestion) => {
                  const Icon = suggestion.icon;
                  return (
                    <article className="planner-suggestion" key={suggestion.id}>
                      <span className="planner-suggestion-icon"><Icon size={20} strokeWidth={1.7} /></span>
                      <div>
                        <h4>{suggestion.title}</h4>
                        <p>{suggestion.detail}</p>
                        <strong>{formatNaira(suggestion.subtotal)}</strong>
                      </div>
                      <button
                        type="button"
                        aria-label={plannedEvent
                          ? `Add ${suggestion.product.name} suggestion to cart`
                          : `Save your event before adding ${suggestion.product.name}`}
                        disabled={!plannedEvent}
                        onClick={() => addSuggestion(suggestion)}
                      >
                        <Plus size={18} />
                      </button>
                    </article>
                  );
                })}
              </div>
              <div className="planner-estimate">
                <span>{copy.eventPlanner.deliveryEstimate}</span>
                <strong>{delivery ? formatNaira(delivery.fee) : copy.eventPlanner.deliveryCityPrompt}</strong>
                <span>{delivery ? copy.eventPlanner.totalEstimate : copy.eventPlanner.goodsEstimate}</span>
                <strong>{formatNaira(estimate)}</strong>
              </div>
              {plannedEvent ? (
                <button className="button button-pink planner-add-all" type="button" onClick={addAllSuggestions}>
                  {copy.eventPlanner.action}
                  <ArrowRight size={17} />
                </button>
              ) : (
                <p className="planner-save-prompt">{copy.eventPlanner.saveBeforeAdd}</p>
              )}
            </div>
          ) : plannedEvent ? (
            <p className="planner-guest-prompt">{copy.eventPlanner.insufficientNotice}</p>
          ) : (
            <p className="planner-guest-prompt">
              {hasLeadTime ? copy.eventPlanner.guestPrompt : copy.eventPlanner.insufficientNotice}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
