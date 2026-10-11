const LABELS = {
    exterior: '🖌️ Exterior:',
    roof:     '😎 Roof:',
    wheels:   '🛴 Wheels:',
    interior: '💺 Interior:',
};

const Selection = ({ part, option }) => (
    <div className="car-selection" style={{ backgroundImage: option ? `url(${option.image_url})` : 'none' }}>
        <div className="car-selection-overlay">
            <div className="car-selection-details">
                <p><strong>{LABELS[part]}</strong> {option?.name ?? '—'}</p>
                <p className="option-price">💵 ${option?.price ?? 0}</p>
            </div>
        </div>
    </div>
);

const CarSelections = ({ selected, price, actions }) => (
    <div className="details-content">
        <div className="car-details-price"><p>💰 ${price}</p></div>
        <Selection part="exterior" option={selected.exterior} />
        <Selection part="roof" option={selected.roof} />
        <div className="car-modify">{actions}</div>
        <Selection part="wheels" option={selected.wheels} />
        <Selection part="interior" option={selected.interior} />
    </div>
);

export default CarSelections;