const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/auth')
const { getBids, placeBid, acceptBid } = require('../controllers/bids')

router.get('/:shipmentId', verifyToken, getBids)
router.post('/', verifyToken, placeBid)
router.put('/:id/accept', verifyToken, acceptBid)

module.exports = router