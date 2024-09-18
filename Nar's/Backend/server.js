const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const db = mysql.createConnection({
  host: "localhost",
  user: 'root',
  password: '', 
  database: 'nar\'s' 
});

app.post('/signup', async (req, res) => {
  const { firstname, lastname, address, mobile, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const signupSql = `INSERT INTO registered_users (firstName, lastName, address, contact, email, password) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(signupSql, [firstname, lastname, address, mobile, email, hashedPassword], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred during signup' });
      }

      const loginSql = `INSERT INTO user_login (user_firstname, user_lastname, contact, email) VALUES (?, ?, ?, ?)`;
      db.query(loginSql, [firstname, lastname, mobile, email], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'An error occurred during signup' });
        }
        return res.status(200).json({ message: 'Signup successful' });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'An error occurred during signup' });
  }
});

app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = `SELECT * FROM registered_users WHERE email = ?`;
    db.query(sql, [email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred during signin' });
      }

      if (result.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, result[0].password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Record login time
      const loginTime = new Date();
      const recordLoginSql = `INSERT INTO user_login (user_firstname, user_lastname, contact, email, login_time) VALUES (?, ?, ?, ?, ?)`;
      db.query(recordLoginSql, [result[0].firstname, result[0].lastname, result[0].contact, email, loginTime], (err, loginResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'An error occurred while recording login time' });
        }

        req.session.user = result[0];
        req.session.loginId = loginResult.insertId; // Store the login record ID in the session
        res.cookie('user', result[0].firstname, { maxAge: 900000, httpOnly: true });
        
        return res.status(200).json({ success: true, message: 'Signin successful', firstName: result[0].firstname });
      });
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: 'An error occurred during signin' });
  }
});

app.post('/place-order', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const { billingInfo, paymentMethod, cartItems, subtotal, delivery, total } = req.body;

  // Generate a tracking number
  const trackingNumber = crypto.randomBytes(8).toString('hex').toUpperCase();

  db.beginTransaction((err) => {
    if (err) {
      console.error('Error beginning transaction:', err);
      return res.status(500).json({ error: 'An error occurred while placing the order' });
    }

    const orderSql = 'INSERT INTO orders (user_id, full_name, phone_number, address, city, state_province, postal_code, delivery_address, payment_method, subtotal, delivery_fee, total, tracking_number, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(orderSql, [req.session.user.id, billingInfo.fullName, billingInfo.phoneNumber, billingInfo.address, billingInfo.city, billingInfo.stateProvince, billingInfo.postalCode, billingInfo.deliveryAddress, paymentMethod, subtotal, delivery, total, trackingNumber, 'Order Placed'], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error inserting order:', err);
          res.status(500).json({ error: 'An error occurred while placing the order' });
        });
      }

      const orderId = result.insertId;

      const itemPromises = cartItems.map(item => {
        return new Promise((resolve, reject) => {
          const itemSql = 'INSERT INTO ordered_products (name, product_id, order_id, quantity, price) VALUES (?, ?, ?, ?, ?)';
          db.query(itemSql, [item.name, item.id, orderId, item.quantity, item.price], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      Promise.all(itemPromises)
        .then(() => {
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err);
                res.status(500).json({ error: 'An error occurred while placing the order' });
              });
            }
            res.json({ success: true, orderId, trackingNumber });
          });
        })
        .catch((err) => {
          db.rollback(() => {
            console.error('Error inserting order items:', err);
            res.status(500).json({ error: 'An error occurred while placing the order' });
          });
        });
    });
  });
});


// Add a new route to fetch order details
app.get('/order/:orderId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const orderId = req.params.orderId;

  const orderSql = `
    SELECT o.*, op.name, op.product_id, op.quantity, op.price, p.image_url
    FROM orders o
    JOIN ordered_products op ON o.id = op.order_id
    JOIN products p ON op.product_id = p.id
    WHERE o.id = ? AND o.user_id = ?
  `;

  db.query(orderSql, [orderId, req.session.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).json({ error: 'An error occurred while fetching order details' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderDetails = {
      orderId: results[0].id,
      trackingNumber: results[0].tracking_number,
      status: results[0].status,
      billingInfo: {
        fullName: results[0].full_name,
        phoneNumber: results[0].phone_number,
        address: results[0].address,
        city: results[0].city,
        stateProvince: results[0].state_province,
        postalCode: results[0].postal_code,
        deliveryAddress: results[0].delivery_address,
      },
      paymentMethod: results[0].payment_method,
      items: results.map(item => ({
        id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.image_url,
      })),
      subtotal: results[0].subtotal,
      delivery: results[0].delivery_fee,
      total: results[0].total,
    };

    res.json(orderDetails);
  });
});

app.get('/order-tracking/:orderId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const orderId = req.params.orderId;

  const sql = `
    SELECT id, tracking_number, status, created_at
    FROM orders
    WHERE id = ? AND user_id = ?
  `;

  db.query(sql, [orderId, req.session.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching order tracking:', err);
      return res.status(500).json({ error: 'An error occurred while fetching order tracking' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(results[0]);
  });
});

app.post('/submit-ratings/:orderId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const orderId = req.params.orderId;
  const { ratings, feedback } = req.body;

  console.log('Received ratings:', ratings); // Add this line for debugging

  // First, check if the order belongs to the user and is in 'Delivered' status
  const checkOrderSql = `
    SELECT id FROM orders
    WHERE id = ? AND user_id = ? AND status = 'Delivered'
  `;

  db.query(checkOrderSql, [orderId, req.session.user.id], (err, orderResult) => {
    if (err) {
      console.error('Error checking order:', err);
      return res.status(500).json({ error: 'An error occurred while submitting ratings' });
    }

    if (orderResult.length === 0) {
      return res.status(400).json({ error: 'Invalid order or order cannot be rated' });
    }

    // Fetch the products for this order
    const fetchProductsSql = `
      SELECT product_id FROM ordered_products
      WHERE order_id = ?
    `;

    db.query(fetchProductsSql, [orderId], (err, productsResult) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'An error occurred while submitting ratings' });
      }

      console.log('Fetched products:', productsResult); // Add this line for debugging

      // Insert ratings for each product
      const insertRatingSql = `
        INSERT INTO product_ratings (order_id, product_id, rating)
        VALUES (?, ?, ?)
      `;

      const ratingPromises = Object.entries(ratings).map(([productId, rating]) => {
        return new Promise((resolve, reject) => {
          // Check if the product exists in the order
          const product = productsResult.find(p => p.product_id == productId);
          if (!product) {
            console.error(`Product ${productId} not found in order ${orderId}`);
            return resolve(); // Skip this product if it's not found
          }

          db.query(insertRatingSql, [orderId, productId, rating], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      Promise.all(ratingPromises)
        .then(() => {
          // Insert feedback
          const insertFeedbackSql = `
            INSERT INTO order_feedback (order_id, feedback)
            VALUES (?, ?)
          `;

          db.query(insertFeedbackSql, [orderId, feedback], (err) => {
            if (err) {
              console.error('Error inserting feedback:', err);
              return res.status(500).json({ error: 'An error occurred while submitting feedback' });
            }

            // Update the order to mark it as rated
            const updateOrderSql = `
              UPDATE orders
              SET is_rated = 1
              WHERE id = ?
            `;

            db.query(updateOrderSql, [orderId], (err) => {
              if (err) {
                console.error('Error updating order:', err);
                return res.status(500).json({ error: 'An error occurred while submitting ratings' });
              }

              res.json({ success: true, message: 'Ratings and feedback submitted successfully' });
            });
          });
        })
        .catch((err) => {
          console.error('Error inserting ratings:', err);
          res.status(500).json({ error: 'An error occurred while submitting ratings' });
        });
    });
  });
});

// In server.js, replace the existing order history query with this:
app.get('/order-history', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  // First, check if the is_rated column exists
  const checkColumnSql = `
    SELECT COUNT(*) AS column_exists 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'is_rated'
  `;

  db.query(checkColumnSql, (err, result) => {
    if (err) {
      console.error('Error checking for is_rated column:', err);
      return res.status(500).json({ error: 'An error occurred while fetching order history' });
    }

    const isRatedExists = result[0].column_exists > 0;

    let sql;
    if (isRatedExists) {
      sql = `
        SELECT o.id, o.tracking_number, o.status, o.order_date, o.total, o.is_rated,
               GROUP_CONCAT(op.name SEPARATOR ', ') AS products
        FROM orders o
        JOIN ordered_products op ON o.id = op.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
    } else {
      sql = `
        SELECT o.id, o.tracking_number, o.status, o.order_date, o.total,
               FALSE AS is_rated,
               GROUP_CONCAT(op.name SEPARATOR ', ') AS products
        FROM orders o
        JOIN ordered_products op ON o.id = op.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.order_date DESC
      `;
    }

    db.query(sql, [req.session.user.id], (err, results) => {
      if (err) {
        console.error('Error fetching order history:', err);
        return res.status(500).json({ error: 'An error occurred while fetching order history' });
      }

      res.json(results);
    });
  });
});

app.post('/cancel-order/:orderId', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const orderId = req.params.orderId;

  const sql = `
    UPDATE orders
    SET status = 'Cancelled'
    WHERE id = ? AND user_id = ? AND status = 'Order Placed'
  `;

  db.query(sql, [orderId, req.session.user.id], (err, result) => {
    if (err) {
      console.error('Error cancelling order:', err);
      return res.status(500).json({ error: 'An error occurred while cancelling the order' });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Order not found or cannot be cancelled' });
    }

    res.json({ success: true, message: 'Order cancelled successfully' });
  });
});

// Update the all-orders route
app.get('/all-orders', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const sql = `
    SELECT id, tracking_number, status, order_date, total
    FROM orders
    WHERE user_id = ?
    ORDER BY order_date DESC
  `;

  db.query(sql, [req.session.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching all orders:', err);
      return res.status(500).json({ error: 'An error occurred while fetching orders', details: err.message });
    }

    res.json(results);
  });
});


// Route to handle user logout
app.get('/logout', (req, res) => {
  if (req.session.user && req.session.loginId) {
    const logoutTime = new Date();
    const updateLogoutSql = `UPDATE user_login SET logout_time = ? WHERE id = ?`;
    db.query(updateLogoutSql, [logoutTime, req.session.loginId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'An error occurred while recording logout time' });
      }

      req.session.destroy((err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'An error occurred during logout' });
        }
        res.clearCookie('user');
        return res.status(200).json({ success: true, message: 'Logout successful' });
      });
    });
  } else {
    return res.status(401).json({ error: 'No active session found' });
  }
});

// Route to fetch user information
app.get('/user', (req, res) => {
  if (req.session.user) {
    // If the user is logged in, return user data
    return res.status(200).json({
      success: true,
      firstName: req.session.user.firstname,
      // Add other user data fields as needed
    });
  } else {
    // If the user is not logged in, return an unauthorized error
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

// server.js
app.get('/products', (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ error: 'An error occurred while fetching products', details: err.message });
    }
    return res.status(200).json(data);
  });
});

// New route to fetch products by category
app.get('/products/category/:categoryName', (req, res) => {
  const categoryName = req.params.categoryName;
  const sql = "SELECT * FROM products WHERE category = ?";
  db.query(sql, [categoryName], (err, data) => {
    if (err) {
      console.error("Error fetching products by category:", err);
      return res.status(500).json({ error: 'An error occurred while fetching products by category', details: err.message });
    }
    console.log(`Fetched ${data.length} products for category: ${categoryName}`);
    return res.status(200).json(data);
  });
});


app.post('/cart/add', (req, res) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  req.session.cart.push(req.body);
  res.json({ success: true, cart: req.session.cart });
});

// Route to get cart items
app.get('/cart', (req, res) => {
  res.json({ cart: req.session.cart || [] });
});

// Route to update cart item quantity
app.put('/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
  }
  res.json({ success: true, cart: req.session.cart });
});

// Route to remove item from cart
app.delete('/cart/remove/:productId', (req, res) => {
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(item => item.id !== parseInt(req.params.productId));
  }
  res.json({ success: true, cart: req.session.cart });
});

// Add this new route to fetch limited items
app.get('/limited-items', (req, res) => {
  const sql = "SELECT * FROM products WHERE category = 'Limited'";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching limited items:", err);
      return res.status(500).json({ error: 'An error occurred while fetching limited items', details: err.message });
    }
    console.log("Fetched limited items:", data.length);
    return res.status(200).json(data);
  });
});

// Route to fetch categories
app.get('/categories', (req, res) => {
  const sql = "SELECT DISTINCT category FROM products WHERE category != 'Limited'";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error fetching categories:", err);
      return res.status(500).json({ error: 'An error occurred while fetching categories', details: err.message });
    }
    const categories = data.map(item => ({ id: item.category, name: item.category }));
    console.log("Fetched categories:", categories);
    return res.status(200).json(categories);
  });
});

// Route to retrieve all users (for testing purposes)
app.get('/registered_users', (req, res) => {
  const sql = "SELECT * FROM registered_users";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: 'An error occurred while fetching users' });
    return res.status(200).json(data);
  });
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
