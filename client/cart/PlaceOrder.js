import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {makeStyles} from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import auth from './../auth/auth-helper'
import cart from './cart-helper.js'
import {create, getRazorpayKey, createRazorpayOrder} from './../order/api-order.js'
import {Redirect} from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  subheading: {
    color: 'rgba(88, 114, 128, 0.87)',
    marginTop: "20px",
  },
  checkout: {
    float: 'right',
    margin: '20px 30px'
  },
  error: {
    display: 'inline',
    padding: "0px 10px"
  },
  errorIcon: {
    verticalAlign: 'middle'
  }
}))

const PlaceOrder = (props) => {
  const classes = useStyles()
  const [values, setValues] = useState({
    order: {},
    error: '',
    redirect: false,
    orderId: ''
  })

  const placeOrder = () => {
    const details = props.checkoutDetails
    if (!details.customer_name || !details.customer_email || 
        !details.delivery_address.street || !details.delivery_address.city || 
        !details.delivery_address.zipcode || !details.delivery_address.country) {
      setValues({...values, error: "Please fill out all the checkout and delivery details first."})
      return
    }

    const jwt = auth.isAuthenticated()
    if (!jwt) {
      setValues({...values, error: "Please sign in to place an order."})
      return
    }

    const total = props.checkoutDetails.products.reduce((sum, item) => sum + (item.quantity * item.product.price), 0)

    // 1. Get Razorpay Public Key ID
    getRazorpayKey({t: jwt.token}).then(keyData => {
      if (!keyData || keyData.error) {
        setValues({...values, error: keyData ? keyData.error : "Could not fetch payment key"})
        return
      }

      // 2. Create Razorpay Order
      createRazorpayOrder({t: jwt.token}, total).then(orderData => {
        if (!orderData || orderData.error) {
          setValues({...values, error: orderData ? orderData.error : "Could not initialize payment order"})
          return
        }

        // 3. Open Razorpay Checkout overlay
        const options = {
          key: keyData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "MERN Marketplace",
          description: "Order Checkout Payment",
          order_id: orderData.id,
          handler: function (response) {
            const paymentInfo = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            }

            // 4. Create local order after successful transaction
            create({userId: jwt.user._id}, {t: jwt.token}, props.checkoutDetails, paymentInfo).then((data) => {
              if (!data || data.error) {
                setValues({...values, error: data ? data.error : "Could not save your order"})
              } else {
                cart.emptyCart(() => {
                  setValues({...values, 'orderId': data._id, 'redirect': true})
                })
              }
            })
          },
          prefill: {
            name: props.checkoutDetails.customer_name,
            email: props.checkoutDetails.customer_email
          },
          theme: {
            color: "#3f51b5"
          }
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      })
    })
  }

  if (values.redirect) {
    return (<Redirect to={'/order/' + values.orderId}/>)
  }

  return (
    <span>
      <Typography type="subheading" component="h3" className={classes.subheading}>
        Payment
      </Typography>
      <Typography variant="body2" style={{margin: '10px 0', color: 'rgba(0, 0, 0, 0.54)'}}>
        Review details above and click the button to complete payment via Razorpay.
      </Typography>
      <div className={classes.checkout}>
        { values.error &&
          (<Typography component="span" color="error" className={classes.error}>
            <Icon color="error" className={classes.errorIcon}>error</Icon>
              {values.error}
          </Typography>)
        }
        <Button color="secondary" variant="contained" onClick={placeOrder}>Place Order</Button>
      </div>
    </span>
  )
}

PlaceOrder.propTypes = {
  checkoutDetails: PropTypes.object.isRequired
}

export default PlaceOrder
