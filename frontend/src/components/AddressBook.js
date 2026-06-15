import React, { useState } from 'react';
import { useUserLocation } from '../context/LocationContext';
import { getCurrentPosition } from '../utils/geo';
import { PinIcon, HomeIcon, BriefcaseIcon, PlusIcon } from './icons';
import './LocationPill.css';

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
        strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12l5 5 9-11" />
    </svg>
);
const TrashIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    </svg>
);

const iconForLabel = (label = '') => {
    const l = label.toLowerCase();
    if (l.includes('home')) return <HomeIcon />;
    if (l.includes('work')) return <BriefcaseIcon />;
    return <PinIcon />;
};

const emptyForm = { label: 'Home', address: '', latitude: '', longitude: '' };

/**
 * Reusable saved-address book — lists the user's addresses (Select / Edit /
 * Delete), an optional "use my current location" row, and an "Add new address"
 * inline form. Backed by LocationContext (localStorage + best-effort server
 * sync). Used by the navbar "Where to?" modal and the Profile page.
 */
const AddressBook = ({ onPick, includeCurrentLocation = false }) => {
    const loc = useUserLocation();
    const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [locating, setLocating] = useState(false);

    const isActive = (a) =>
        loc.active &&
        Number(loc.active.lat) === Number(a.latitude) &&
        Number(loc.active.lng) === Number(a.longitude);

    const handleUseCurrent = async () => {
        const c = await loc.useCurrentLocation();
        if (c && onPick) onPick();
    };

    const startAdd = () => { setForm(emptyForm); setFormError(''); setMode('add'); };
    const startEdit = (a) => {
        setForm({ label: a.label || 'Other', address: a.address || '', latitude: String(a.latitude), longitude: String(a.longitude) });
        setEditId(a.id);
        setFormError('');
        setMode('edit');
    };
    const backToList = () => { setMode('list'); setForm(emptyForm); setEditId(null); setFormError(''); };

    const onFormChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const fillFromGeolocation = async () => {
        setLocating(true);
        setFormError('');
        try {
            const c = await getCurrentPosition();
            setForm((f) => ({ ...f, latitude: c.lat.toFixed(6), longitude: c.lng.toFixed(6) }));
        } catch (err) {
            setFormError(err && err.code === 1
                ? 'Location was blocked — enter coordinates manually.'
                : 'Could not get your location — enter coordinates manually.');
        } finally {
            setLocating(false);
        }
    };

    const saveForm = (e) => {
        e.preventDefault();
        const lat = Number(form.latitude);
        const lng = Number(form.longitude);
        if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
            setFormError('Enter valid coordinates (latitude -90..90, longitude -180..180).');
            return;
        }
        const payload = { label: form.label.trim() || 'Other', address: form.address.trim(), latitude: lat, longitude: lng };
        if (mode === 'add') {
            const added = loc.addAddress(payload);
            loc.selectAddress(added);
            backToList();
            if (onPick) onPick();
        } else {
            loc.updateAddress(editId, payload);
            backToList();
        }
    };

    if (mode !== 'list') {
        return (
            <form className="loc-form" onSubmit={saveForm}>
                <label className="loc-form__label">Label</label>
                <select name="label" value={form.label} onChange={onFormChange} className="loc-form__input">
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                </select>

                <label className="loc-form__label">Address</label>
                <input name="address" value={form.address} onChange={onFormChange} className="loc-form__input" placeholder="e.g., Sderot HaKibutsim 17" />

                <button type="button" className="loc-btn loc-btn--wide" onClick={fillFromGeolocation} disabled={locating}>
                    {locating ? 'Locating…' : '📍 Use my current location'}
                </button>

                <div className="loc-form__coords">
                    <input name="latitude" type="number" step="any" value={form.latitude} onChange={onFormChange} className="loc-form__input" placeholder="Latitude" />
                    <input name="longitude" type="number" step="any" value={form.longitude} onChange={onFormChange} className="loc-form__input" placeholder="Longitude" />
                </div>

                {formError && <p className="loc-form__error">{formError}</p>}

                <div className="loc-form__actions">
                    <button type="button" className="loc-btn" onClick={backToList}>Back</button>
                    <button type="submit" className="loc-btn loc-btn--primary">{mode === 'add' ? 'Add address' : 'Save changes'}</button>
                </div>
            </form>
        );
    }

    return (
        <>
            {includeCurrentLocation && (
                <button type="button" className="loc-row" onClick={handleUseCurrent} disabled={loc.status === 'loading'}>
                    <span className="loc-row__icon" aria-hidden="true"><PinIcon /></span>
                    <span className="loc-row__body">
                        <span className="loc-row__title">Use my current location</span>
                        <span className="loc-row__sub">
                            {loc.status === 'loading' ? 'Locating…'
                                : loc.status === 'denied' ? 'Location is blocked in your browser'
                                : loc.status === 'unavailable' ? 'Location is unavailable'
                                : 'Find restaurants near you'}
                        </span>
                    </span>
                    {loc.active && loc.active.label === 'Current location' && (
                        <span className="loc-row__check" aria-hidden="true"><CheckIcon /></span>
                    )}
                </button>
            )}

            {loc.addresses.length === 0 && (
                <p className="loc-empty">No saved addresses yet — add one below.</p>
            )}

            {loc.addresses.map((a) => (
                <div className="loc-row loc-row--saved" key={a.id}>
                    <span className="loc-row__icon" aria-hidden="true">{iconForLabel(a.label)}</span>
                    <span className="loc-row__body">
                        <span className="loc-row__title">
                            {a.label}
                            {isActive(a) && <span className="loc-row__check loc-row__check--inline" aria-hidden="true"><CheckIcon /></span>}
                        </span>
                        {a.address && <span className="loc-row__sub">{a.address}</span>}
                    </span>
                    <span className="loc-row__actions">
                        <button type="button" className="loc-btn" onClick={() => startEdit(a)}>Edit</button>
                        <button type="button" className="loc-btn loc-btn--danger" onClick={() => loc.removeAddress(a.id)} aria-label={`Delete ${a.label}`}><TrashIcon /></button>
                        <button type="button" className="loc-btn loc-btn--primary" onClick={() => { loc.selectAddress(a); if (onPick) onPick(); }}>Select</button>
                    </span>
                </div>
            ))}

            <button type="button" className="loc-row loc-row--add" onClick={startAdd}>
                <span className="loc-row__icon loc-row__icon--add" aria-hidden="true"><PlusIcon /></span>
                <span className="loc-row__body"><span className="loc-row__title">Add new address</span></span>
            </button>
        </>
    );
};

export default AddressBook;
