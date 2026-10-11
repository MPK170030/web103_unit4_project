import { useState } from 'react';

const OptionPicker = ({ part, options, selectedId, onSelect, convertible }) => {
    const [isOpen, setIsOpen] = useState(false);

    const close = (e) => {
        e?.preventDefault();
        setIsOpen(false);
    };

    const choose = (option) => {
        if (option.convertible_only && !convertible) {
            alert('That roof is only available on convertibles. Check "Convertible" first.');
            return;
        }
        onSelect(option);
        setIsOpen(false);
    };

    return (
        <div id="car-options">
            <button onClick={() => setIsOpen(true)}>{part}</button>

            <dialog open={isOpen} onClick={(e) => e.target === e.currentTarget && close()}>
                <article className="option-modal">
                    <header>
                        <a href="#close" aria-label="Close" className="close" onClick={close}></a>
                        <h3>Choose {part}</h3>
                    </header>

                    <div className="available-options">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                id={`${part}${option.id}`}
                                className={`option-card${option.id === selectedId ? ' selected' : ''}`}
                                style={{ backgroundImage: `url(${option.image_url})` }}
                                onClick={() => choose(option)}
                            >
                                <div className="option-card-overlay">
                                    <div className="option-card-details">
                                        <p>{option.name} <br /> 💵 ${option.price}</p>
                                        <p>{option.convertible_only ? 'convertible only' : ''}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>
            </dialog>
        </div>
    );
};

export default OptionPicker;