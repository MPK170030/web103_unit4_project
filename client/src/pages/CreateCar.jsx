import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import OptionPicker from '../components/OptionPicker';
import { PARTS, calcPrice } from '../utilities/carUtils';


const emptySelection = { exterior: null, roof: null, wheels: null, interior: null };

const CreateCar = ({ title }) => {
    useEffect(() => { document.title = title; }, [title]);

    const navigate = useNavigate();

    const [options, setOptions] = useState({ exteriors: [], roofs: [], wheels: [], interiors: [] });
    const [selected, setSelected] = useState(emptySelection);
    const [convertible, setConvertible] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
        api.getAllOptions()
            .then(setOptions)
            .catch((err) => alert(`Could not load options: ${err.message}`));
    }, []);

    const toggleConvertible = (e) => {
        const checked = e.target.checked;
        setConvertible(checked);
        // Unchecking drops a convertible-only roof that was already chosen
        if (!checked && selected.roof?.convertible_only) {
            setSelected((prev) => ({ ...prev, roof: null }));
        }
    };

    const handleSubmit = async () => {
        const missing = PARTS.filter(({ key }) => !selected[key]).map(({ key }) => key);
        if (missing.length) {
            alert(`Please choose: ${missing.join(', ')}`);
            return;
        }

        try {
            await api.createCar({
                name: name.trim() || 'My New Car',
                convertible,
                exterior_id: selected.exterior.id,
                roof_id: selected.roof.id,
                wheels_id: selected.wheels.id,
                interior_id: selected.interior.id,
            });
            navigate('/customcars');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="create-car">
            <label>
                <input type="checkbox" id="isconvertible" checked={convertible} onChange={toggleConvertible} />
                Convertible
            </label>

            <div className="create-car-options">
                <div id="customization-options" className="car-options">
                    {PARTS.map(({ key, table }) => (
                        <OptionPicker
                            key={key}
                            part={key}
                            options={options[table]}
                            selectedId={selected[key]?.id}
                            convertible={convertible}
                            onSelect={(option) => setSelected((prev) => ({ ...prev, [key]: option }))}
                        />
                    ))}
                </div>
            </div>

            <div className="create-car-price">💰${calcPrice(selected, convertible)}</div>

            <div className="create-car-name">
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="My New Car"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input type="submit" className="create-car-button" value="Create" onClick={handleSubmit} />
            </div>
        </div>
    );
};

export default CreateCar;