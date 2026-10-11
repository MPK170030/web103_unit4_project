const BASE_URL = '/api';

const request = async (path, options = {}) => {
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error ?? `Request failed (${response.status})`);
    }
    return data;
};

const getExteriors = () => request('/exteriors');
const getRoofs     = () => request('/roofs');
const getInteriors = () => request('/interiors');
const getWheels    = () => request('/wheels');

const getAllOptions = async () => {
    const [exteriors, roofs, interiors, wheels] = await Promise.all([
        getExteriors(), getRoofs(), getInteriors(), getWheels(),
    ]);
    return { exteriors, roofs, interiors, wheels };
};

const getCars    = () => request('/cars');
const getCarById = (id) => request(`/cars/${id}`);

const createCar = (car) =>
    request('/cars', { method: 'POST', body: JSON.stringify(car) });

const updateCar = (id, car) =>
    request(`/cars/${id}`, { method: 'PATCH', body: JSON.stringify(car) });

const deleteCar = (id) =>
    request(`/cars/${id}`, { method: 'DELETE' });

export default {
    getExteriors,
    getRoofs,
    getInteriors,
    getWheels,
    getAllOptions,
    getCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar,
};