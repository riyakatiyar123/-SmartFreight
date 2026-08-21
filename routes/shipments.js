const { completeDelivery } = require('../controllers/shipments')
router.post('/:id/complete', verifyToken, completeDelivery)
const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const {
    getAllShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment
} = require('../controllers/shipments')

router.get('/', verifyToken, getAllShipments)
router.get('/:id', verifyToken, getShipment)
router.post('/', verifyToken, createShipment)
router.put('/:id', verifyToken, updateShipment)
router.delete('/:id', verifyToken, deleteShipment)

module.exports = router