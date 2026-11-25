import React from 'react';
import { deliveryCities } from '../../data/delivery.js';
import { copy } from '../../data/copy.js';
import { dateAfterDays } from '../../utils/format.js';

export default function EventForm({
  value,
  onChange,
  onSubmit,
  submitLabel,
  leadTimeDays = 0,
  showType = true,
  error = '',
}) {
  const dateMinimum = dateAfterDays(leadTimeDays);

  const updateField = (event) => {
    onChange({ ...value, [event.target.name]: event.target.value });
  };

  return (
    <form className="event-form" onSubmit={(event) => {
      event.preventDefault();
      onSubmit();
    }}>
      <label className="modal-field">
        <span>{copy.eventForm.name.label}</span>
        <input
          autoComplete="off"
          name="name"
          type="text"
          maxLength={70}
          required
          value={value.name}
          onChange={updateField}
          placeholder={copy.eventForm.name.placeholder}
        />
        <small>{copy.eventForm.name.hint}</small>
      </label>
      {showType && (
        <label className="modal-field">
          <span>{copy.eventForm.type.label}</span>
          <select name="type" required value={value.type} onChange={updateField}>
            <option value="">{copy.eventForm.type.placeholder}</option>
            {copy.eventForm.types.map((type) => <option value={type} key={type}>{type}</option>)}
          </select>
          <small>{copy.eventForm.type.hint}</small>
        </label>
      )}
      <label className="modal-field">
        <span>{copy.eventForm.date.label}</span>
        <input
          name="date"
          type="date"
          required
          min={dateMinimum}
          value={value.date}
          onChange={updateField}
        />
        <small>
          {leadTimeDays > 0
            ? copy.eventForm.date.leadHint.replace('{days}', leadTimeDays)
            : copy.eventForm.date.hint}
        </small>
      </label>
      <label className="modal-field">
        <span>{copy.eventForm.guests.label}</span>
        <input
          name="guests"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          required
          value={value.guests}
          onChange={updateField}
          placeholder={copy.eventForm.guests.placeholder}
        />
        <small>{copy.eventForm.guests.hint}</small>
      </label>
      <label className="modal-field">
        <span>{copy.eventForm.city.label}</span>
        <select name="city" required value={value.city} onChange={updateField}>
          <option value="">{copy.eventForm.city.placeholder}</option>
          {deliveryCities.map((city) => <option value={city} key={city}>{city}</option>)}
        </select>
        <small>{copy.eventForm.city.hint}</small>
      </label>
      {error && <p className="event-form-error" role="alert">{error}</p>}
      <button className="button button-pink event-form-submit" type="submit">{submitLabel}</button>
    </form>
  );
}
