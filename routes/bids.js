const express = require('express')

const router = express.Router()

const verifyToken =
    require('../middleware/auth')

const {
    getBids,
    getDashboardBidCount,
    placeBid,
    acceptBid
} = require('../controllers/bids')


// ========================================
// DASHBOARD BID COUNT
// ========================================

/*
    IMPORTANT:

    This route MUST come before:

        /:shipmentId

    Otherwise "dashboard" could be treated
    as a shipmentId.
*/

router.get(
    '/dashboard/count',
    verifyToken,
    getDashboardBidCount
)


// ========================================
// GET BIDS FOR SHIPMENT
// ========================================

router.get(
    '/:shipmentId',
    verifyToken,
    getBids
)


// ========================================
// PLACE BID
// ========================================

router.post(
    '/',
    verifyToken,
    placeBid
)


// ========================================
// ACCEPT BID
// ========================================

router.put(
    '/:id/accept',
    verifyToken,
    acceptBid
)


module.exports = router