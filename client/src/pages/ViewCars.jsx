import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import coupe from '../assets/coupe.png';
import convertible from '../assets/convertible.png';

const ViewCars = ({ title }) => {
    useEffect(() => { document.title = title; }, [title]);

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getCars()
            .then(setCars)
            .catch((err) => alert(`Could not load cars: ${err.message}`))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <main><p aria-busy="true">Loading cars…</p></main>;
    if (cars.length === 0) return <main><p>No cars yet. <Link to="/">Customize one</Link>.</p></main>;

    return (
        <main className="view-cars">
            {cars.map((car) => (
                <article key={car.id}>
                    <header>
                        <h3>
                            <img src={car.convertible ? convertible : coupe} alt={car.convertible ? 'Convertible' : 'Coupe'} />
                            {'  '}{car.name}
                        </h3>
                    </header>

                    <div className="car-card">
                        <div className="car-summary">
                            <p><strong>🖌️ Exterior:</strong> {car.exterior.name}</p>
                            <p><strong>😎 Roof:</strong> {car.roof.name}</p>
                        </div>
                        <div className="car-summary">
                            <p><strong>🛴 Wheels:</strong> {car.wheels.name}</p>
                            <p><strong>💺 Interior:</strong> {car.interior.name}</p>
                        </div>
                        <div className="car-price">
                            <p>💰 ${car.price}</p>
                            <Link to={`/customcars/${car.id}`} role="button">Details</Link>
                        </div>
                    </div>
                </article>
            ))}
        </main>
    );
};

export default ViewCars;