const addDemoData = async () => {
  try {
    // 1. Login as Admin
    const loginRes = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@piksmedia.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success) throw new Error('Admin login failed: ' + JSON.stringify(loginData));
    const adminToken = loginData.data.token;
    console.log('Admin logged in.');

    // 2. Add Category
    const catName = 'Demo Category ' + Date.now();
    const catRes = await fetch('http://127.0.0.1:5000/api/v1/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: catName,
        description: 'A demo category',
        sizeUnit: 'inches(in)',
        availableSizes: []
      })
    });
    const catData = await catRes.json();
    let categoryId = catData.data?._id || catData._id;
    if (!categoryId) {
       console.error('Failed to create category:', catData);
       return;
    }
    console.log('Category used:', categoryId);

    // 3. Add Product
    const prodRes = await fetch('http://127.0.0.1:5000/api/v1/catalog/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        title: 'Demo Product ' + Date.now(),
        slug: 'demo-product-' + Date.now(),
        description: 'A beautifully crafted demo product.',
        price: 999,
        image: 'https://via.placeholder.com/400',
        category: categoryId,
        stock: 100,
        returnDays: false,
        replacementDays: false,
        policyText: '',
        mockup: false,
        deliveryCharges: 0,
        gallery: [],
        hasSizeChart: false
      })
    });
    const prodData = await prodRes.json();
    if (!prodData.success) {
      console.error('Failed to create product:', prodData);
      return;
    }
    const productId = prodData.data?._id;
    console.log('Product created:', productId);

    // 4. Register a User
    const userEmail = 'demo.user' + Date.now() + '@example.com';
    const regRes = await fetch('http://127.0.0.1:5000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Demo',
        lastName: 'User',
        email: userEmail,
        password: 'password123'
      })
    });
    const regData = await regRes.json();
    let userToken;
    if (regData.success) {
      userToken = regData.data.token;
    } else {
      console.error('Failed to register user:', regData);
      return;
    }
    console.log('User logged in.');

    // 5. Order Product
    const orderRes = await fetch('http://127.0.0.1:5000/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
      body: JSON.stringify({
        orderItems: [
          {
            product: productId,
            title: 'Demo Product',
            price: 999,
            quantity: 1,
            image: 'https://via.placeholder.com/400',
            size: 'M'
          }
        ],
        shippingAddress: {
          fullName: 'Demo User',
          address: '123 Demo St',
          city: 'Demo City',
          state: 'Demo State',
          postalCode: '123456',
          country: 'Demo Country'
        },
        paymentMethod: 'COD',
        totalPrice: 999
      })
    });
    const orderData = await orderRes.json();
    console.log('Order created:', orderData);

  } catch (err) {
    console.error('Error:', err);
  }
};

addDemoData();
