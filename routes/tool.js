const express = require('express')
const router = express.Router()

const {shippingRates,splitBigTextLabels,downloadBigTextLabels,testAPI} = require('../controllers/toolController')

router.route('/shippingRates').post(shippingRates)
router.route('/splitLabels').post(splitBigTextLabels)
router.route('/downloadResults').get(downloadBigTextLabels)
router.route('/test').get(testAPI)

module.exports = router