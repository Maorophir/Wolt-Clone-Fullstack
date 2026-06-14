import React, { useRef, useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ title, actionLabel, onAction, children }) => {
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true); // Assume true initially

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1); // -1 for rounding errors
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [children]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            // Scroll by roughly one container width minus a card gap
            const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="carousel-container">
            {title && (
                <div className="carousel-header">
                    <h2 className="carousel-title">{title}</h2>
                    <div className="carousel-actions">
                        {actionLabel && (
                            <button className="carousel-action-btn" onClick={onAction}>
                                {actionLabel}
                            </button>
                        )}
                        <div className="carousel-arrows">
                            <button 
                                className={`carousel-arrow ${!canScrollLeft ? 'carousel-arrow--hidden' : ''}`}
                                onClick={() => scroll('left')}
                                disabled={!canScrollLeft}
                                aria-label="Scroll left"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <button 
                                className={`carousel-arrow ${!canScrollRight ? 'carousel-arrow--hidden' : ''}`}
                                onClick={() => scroll('right')}
                                disabled={!canScrollRight}
                                aria-label="Scroll right"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="carousel-wrapper">
                <div 
                    className="carousel-track" 
                    ref={scrollRef} 
                    onScroll={checkScroll}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Carousel;
