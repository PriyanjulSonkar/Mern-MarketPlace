import User from '../models/user.model'
import extend from 'lodash/extend'
import errorHandler from './../helpers/dbErrorHandler'
import request from 'request'
import config from './../../config/config'
import crypto from 'crypto'

const create = async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load user and append to req.
 */
const userByID = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
    if (!user)
      return res.status('400').json({
        error: "User not found"
      })
    req.profile = user
    next()
  } catch (err) {
    return res.status('400').json({
      error: "Could not retrieve user"
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    let users = await User.find().select('name email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let user = req.profile
    user = extend(user, req.body)
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    let user = req.profile
    let deletedUser = await user.remove()
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const isSeller = (req, res, next) => {
  const isSeller = req.profile && req.profile.seller
  if (!isSeller) {
    return res.status('403').json({
      error: "User is not a seller"
    })
  }
  next()
}

const stripe_auth = (req, res, next) => {
  next()
}

const verifyRazorpaySignature = (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body.token || req.body.paymentInfo || {}
  
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({
      error: "Missing payment information from Razorpay"
    })
  }

  const hmac = crypto.createHmac('sha256', config.razorpay_key_secret)
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
  const generated_signature = hmac.digest('hex')

  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({
      error: "Payment verification failed"
    })
  }

  req.body.order.payment_id = razorpay_payment_id
  next()
}

const createCharge = (req, res, next) => {
  next()
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  isSeller,
  stripe_auth,
  verifyRazorpaySignature,
  createCharge
}
