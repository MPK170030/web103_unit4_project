import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import CarSelections from '../components/CarSelections';
import coupe from '../assets/coupe.png';
import convertibleImg from '../assets/convertible.png';

const CarDetails = ({ title }) => {
    useEffect(() => { document.title = title; }, [title]);

    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.getCarById(id)
            .then(setCar)
            .catch((err) => setError(err.message));
    }, [id]);

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
            </header>

            <CarSelections
                selected={car}
                price={car.price}
                actions={
                    <>
                        <Link to={`/edit/${car.id}`} role="button">Edit</Link>{' '}
                        <button className="secondary" onClick={handleDelete}>Delete</button>
                    </>
                }
            />
        </article>
    );
};

export default CarDetails;