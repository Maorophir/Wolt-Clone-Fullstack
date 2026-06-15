import React, { useState } from 'react';
import { useUserLocation } from '../context/LocationContext';
import { PinIcon } from './icons';
import AddressBook from './AddressBook';
import './LocationPill.css';

const ChevronIcon = () => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
    </svg>
);
const CloseIcon = () => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
    </svg>
);

/**
 * Wolt-style navbar location selector: an outlined pill (pin badge + label +
 * chevron) that opens a "Where to?" modal. The modal body is the shared
 * AddressBook (saved addresses + use-current-location + add new), so the navbar
 * and the Profile page manage the exact same addresses.
 */
const LocationPill = () => {
    const loc = useUserLocation();
    const [open, setOpen] = useState(false);

    const pillLabel = loc.active ? loc.active.label : 'Set location';

    return (
        <>
            <button
                type="button"
                className="location-pill"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-label="Set your delivery location"
            >
                <span className="location-pill__badge" aria-hidden="true"><PinIcon /></span>
                <span className="location-pill__text">{pillLabel}</span>
                <span className="location-pill__chevron" aria-hidden="true"><ChevronIcon /></span>
            </button>

            {open && (
                <div className="loc-modal__overlay" role="presentation" onClick={() => setOpen(false)}>
                    <div className="loc-modal" role="dialog" aria-modal="true" aria-label="Choose your location" onClick={(e) => e.stopPropagation()}>
                        <div className="loc-modal__head">
                            <h2 className="loc-modal__title">Where to?</h2>
                            <button type="button" className="loc-modal__close" onClick={() => setOpen(false)} aria-label="Close"><CloseIcon /></button>
                        </div>
                        <AddressBook onPick={() => setOpen(false)} includeCurrentLocation />
                    </div>
                </div>
            )}
        </>
    );
};

export default LocationPill;
