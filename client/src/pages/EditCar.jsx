import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import OptionPicker from '../components/OptionPicker';
import CarSelections from '../components/CarSelections';
import { PARTS, calcPrice } from '../utilities/carUtils';
import coupe from '../assets/coupe.png';
import convertibleImg from '../assets/convertible.png';

const EditCar = ({ title }) => {
    useEffect(() => { document.title = title; }, [title]);

    const { id } = useParams();
    const navigate = useNavigate();

    const [car, setCar] = useState(null);           // saved car (name, convertible)
    const [selected, setSelected] = useState(null); // current picks, starts as the saved ones
    const [options, setOptions] = useState({ exteriors: [], roofs: [], wheels: [], interiors: [] });
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([api.getCarById(id), api.getAllOptions()])
            .then(([carData, optionData]) => {
                setCar(carData);
                setSelected({
                    exterior: carData.exterior,
                    roof: carData.roof,
                    wheels: carData.wheels,
                    interior: carData.interior,
                });
                setOptions(optionData);
            })
            .catch((err) => setError(err.message));
    }, [id]);

    const handleUpdate = async () => {
        try {
            await api.updateCar(id, {
                name: car.name,
                convertible: car.convertible,
                exterior_id: selected.exterior.id,
                roof_id: selected.roof.id,
                wheels_id: selected.wheels.id,
                interior_id: selected.interior.id,
            });
            navigate(`/customcars/${id}`);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete "${car.name}"?`)) return;
        try {
            await api.deleteCar(id);
            navigate('/customcars');
        } catch (err) {
            alert(err.message);
        }
    };

    if (error) return <article><p>{error}</p><Link to="/customcars">Back to cars</Link></article>;
    if (!car) return <p aria-busy="true">Loading car…</p>;

    return (
        <article className="car-full-details">
            <header>
                <h2>
                    <img src={car.convertible ? convertibleImg : coupe} alt={car.convertible ? 'Convertible' : 'Coupe'} />
                    {'  '}{car.name}
                </h2>
                <div className="create-car-options">
                    <div id="customization-options" className="car-options">
                        {PARTS.map(({ key, table }) => (
                            <OptionPicker
                                key={key}
                                part={key}
                                options={options[table]}
                                selectedId={selected[key]?.id}
                                convertible={car.convertible}
                                onSelect={(option) => setSelected((prev) => ({ ...prev, [key]: option }))}
                            />
                        ))}
                    </div>
                </div>
            </header>

            <CarSelections
                selected={selected}
                price={calcPrice(selected, car.convertible)}
                actions={
                    <>
                        <input type="submit" value="Update" onClick={handleUpdate} />
                        <button className="secondary" onClick={handleDelete}>Delete</button>
                    </>
                }
            />
        </article>
    );
};

export default EditCar;