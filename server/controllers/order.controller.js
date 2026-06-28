import { Order, CartItem } from '../models/order.model'
import errorHandler from './../helpers/dbErrorHandler'
import config from '../../config/config'
import Razorpay from 'razorpay'


const create = async (req, res) => {
  try {
    req.body.order.user = req.profile
    let order = new Order(req.body.order)
    let result = await order.save()
    res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByShop = async (req, res) => {
  try {
    let orders = await Order.find({ "products.shop": req.shop._id })
      .populate({ path: 'products.product', select: '_id name price' })
      .sort('-created')
      .exec()
    res.json(orders)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let order = await Order.updateOne({ 'products._id': req.body.cartItemId }, {
      'products.$.status': req.body.status
    })
    res.json(order)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const getStatusValues = (req, res) => {
  res.json(CartItem.schema.path('status').enumValues)
}

const orderByID = async (req, res, next, id) => {
  try {
    let order = await Order.findById(id).populate('products.product', 'name price').populate('products.shop', 'name').exec()
    if (!order)
      return res.status('400').json({
        error: "Order not found"
      })
    req.order = order
    next()
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const listByUser = async (req, res) => {
  try {
    let orders = await Order.find({ "user": req.profile._id })
      .sort('-created')
      .exec()
    res.json(orders)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const read = (req, res) => {
  return res.json(req.order)
}

const getRazorpayKey = (req, res) => {
  res.status(200).json({ key: config.razorpay_key_id })
}

const createRazorpayOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: config.razorpay_key_id,
      key_secret: config.razorpay_key_secret
    })

    const amount = Math.round(req.body.amount * 100)

    const options = {
      amount: amount,
      currency: "INR",
      receipt: "receipt_order_" + Date.now()
    }

    const order = await razorpay.orders.create(options)
    res.status(200).json(order)
  } catch (err) {
    return res.status(400).json({
      error: err.message || "Could not create Razorpay order"
    })
  }
}

export default {
  create,
  listByShop,
  update,
  getStatusValues,
  orderByID,
  listByUser,
  read,
  getRazorpayKey,
  createRazorpayOrder
}
