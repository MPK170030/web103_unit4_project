// Must match BASE_PRICE and CONVERTIBLE_PRICE in server/controllers/cars.js
export const BASE_PRICE = 65000;
export const CONVERTIBLE_PRICE = 10000;

// The four customizable parts, in the order the buttons appear.
// key = name used on the button and in state, table = API/option list name.
export const PARTS = [
    { key: 'exterior', table: 'exteriors' },
    { key: 'roof',     table: 'roofs' },
    { key: 'wheels',   table: 'wheels' },
    { key: 'interior', table: 'interiors' },
];

// selected: { exterior, roof, wheels, interior } — each an option object or null
export const calcPrice = (selected, convertible) =>
    BASE_PRICE
    + (convertible ? CONVERTIBLE_PRICE : 0)
    + PARTS.reduce((sum, { key }) => sum + (selected[key]?.price ?? 0), 0);