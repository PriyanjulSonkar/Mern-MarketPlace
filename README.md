# MERN Marketplace

An online marketplace application with seller accounts, product search and suggestions, shopping cart, order management, payment processing with Razorpay, and live auction with Socket.io - developed using React, Node, Express, and MongoDB. 

<img align="center" src="https://s3.amazonaws.com/mernbook/git+/marketplace.png" width="56%"> <img align="center" src="https://mernbook.s3.amazonaws.com/git+/marketplace-bidding.png" width="42%">


#### What you need to run this code
1. Node.js (v13+ / v22+)
2. NPM or Yarn
3. MongoDB
4. Razorpay account credentials (API Key ID and Key Secret)

#### How to run this code
1. Make sure MongoDB is running on your system.
2. Clone this repository.
3. Create a `.env` file in the root folder with the following structure:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Open the command line in the project folder:
   - To install dependencies, run:
     ```bash
     npm install
     ```
   - To build the application, run:
     ```bash
     npm run build
     ```
   - To run the application in development mode, run:
     ```bash
     npm run development
     ```
5. Open [localhost:3000](http://localhost:3000/) in your browser.
