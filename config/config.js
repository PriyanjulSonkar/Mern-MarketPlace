const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri:
    process.env.MONGODB_URI,
  razorpay_key_id: process.env.RAZORPAY_KEY_ID,
  razorpay_key_secret: process.env.RAZORPAY_KEY_SECRET,
}

export default config
