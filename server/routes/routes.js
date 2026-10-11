import express from 'express';
import CarsController from '../controllers/cars.js';
 
const router = express.Router();

router.get('/cars', CarsController.getCars);
router.get('/cars/:id', CarsController.getCarById);
router.post('/cars', CarsController.createCar);
router.patch('/cars/:id', CarsController.updateCar);
router.delete('/cars/:id', CarsController.deleteCar);

router.get('/:table', CarsController.getOptions);
router.get('/:table/:id', CarsController.getOptionById);
 
export default router;