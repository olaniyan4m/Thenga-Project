import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({status: 'ok', env: process.env.NODE_ENV || 'dev'}));

// Register merchant: creates auth user and merchant doc
app.post('/auth/register', async (req, res) => {
  try {
    const { name, phone, businessName, email, password } = req.body;
    // create Firebase Auth user (phone or email)
    const user = await admin.auth().createUser({
      email: email || undefined,
      phoneNumber: phone || undefined,
      displayName: name || businessName,
      password: password || Math.random().toString(36).slice(-8)
    });
    // create merchant doc
    await db.collection('merchants').doc(user.uid).set({
      name, phone, businessName, email, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ uid: user.uid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create product
app.post('/merchants/:merchantId/catalog', async (req, res) => {
  const { merchantId } = req.params;
  const product = req.body;
  const docRef = await db.collection('merchants').doc(merchantId).collection('products').add({
    ...product,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  res.status(201).json({ id: docRef.id });
});

// List products
app.get('/merchants/:merchantId/catalog', async (req, res) => {
  const { merchantId } = req.params;
  const snap = await db.collection('merchants').doc(merchantId).collection('products').get();
  const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  res.json(products);
});

// Create order
app.post('/merchants/:merchantId/orders', async (req, res) => {
  const { merchantId } = req.params;
  const order = req.body;
  const docRef = await db.collection('merchants').doc(merchantId).collection('orders').add({
    ...order,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  // Here you would generate a payment link using PSP and save payment info
  res.status(201).json({ id: docRef.id });
});

exports.api = functions.https.onRequest(app);


// --- Payment link demo (PSP integration placeholder) ---
// Example: generate a payment link using a hypothetical PSP (PayFast/Yoco style).
// Replace with real PSP credentials and implement secure server-side signing as required.
app.post('/merchants/:merchantId/orders/:orderId/generate-payment', async (req, res) => {
  const { merchantId, orderId } = req.params;
  try {
    // Fetch order doc (simplified)
    const orderRef = db.collection('merchants').doc(merchantId).collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    if (!orderSnap.exists) return res.status(404).json({ error: 'Order not found' });
    const order = orderSnap.data();

    // Demo: create a simple payment object and return a fake link.
    // In production: call PSP API (Yoco/PayFast/Peach) to create payment link or token.
    const paymentRecord = {
      orderId,
      amount: order.totalAmount || order.items?.reduce((s,i)=>s + (i.price||0)*(i.quantity||1),0) || 0,
      currency: 'ZAR',
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      provider: 'demo-psp'
    };
    const payRef = await orderRef.collection('payments').add(paymentRecord);

    // Fake payment link (replace with provider link)
    const paymentLink = `https://pay.demo-psp.local/pay/${payRef.id}`;
    await payRef.update({ paymentLink });

    res.json({ paymentLink, paymentId: payRef.id });
  } catch (err) {
    console.error('Payment link error', err);
    res.status(500).json({ error: err.message });
  }
});

// --- WhatsApp Cloud API send template helper (placeholder) ---
// To use: set environment variables WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Firebase functions config.
// Example usage: POST /send-whatsapp with body { to: '+27...', template: 'acknowledge_order', variables: {...} }
app.post('/send-whatsapp', async (req, res) => {
  const { to, template, variables } = req.body;
  try {
    const token = process.env.WHATSAPP_TOKEN || functions.config().whatsapp?.token;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || functions.config().whatsapp?.phone_number_id;
    if (!token || !phoneNumberId) {
      return res.status(500).json({ error: 'WhatsApp credentials not configured' });
    }
    // Build message body for WhatsApp Cloud API - example for template messages
    const body = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'template',
      template: {
        name: template,
        language: { code: 'en_US' },
        components: [{
          type: 'body',
          parameters: (variables || []).map(v => ({ type: 'text', text: String(v) }))
        }]
      }
    };
    const fetch = require('node-fetch');
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    res.json({ ok: true, data });
  } catch (err) {
    console.error('WhatsApp send error', err);
    res.status(500).json({ error: err.message });
  }
});


// --- PayFast integration example (server-side) ---
// Notes:
// * Replace PAYFAST_MERCHANT_ID, PAYFAST_MERCHANT_KEY with values stored securely via `firebase functions:config:set`
// * For PayFast, you typically build a checkout form with signature and redirect or use API for recurring/subscriptions.
// * Below is a simplified server-side endpoint to create a PayFast payment request URL (demo).
app.post('/payments/payfast/create', async (req, res) => {
  try {
    const { merchantId, orderId, amount, itemName } = req.body;
    // Build PayFast payment request params (demo)
    const pfData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID || functions.config().payfast?.merchant_id,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY || functions.config().payfast?.merchant_key,
      return_url: req.body.returnUrl || 'https://yourdomain/return',
      cancel_url: req.body.cancelUrl || 'https://yourdomain/cancel',
      notify_url: req.body.notifyUrl || 'https://yourdomain/api/payments/payfast/webhook',
      m_payment_id: `${merchantId}-${orderId}`,
      amount: amount,
      item_name: itemName || `Pezela order ${orderId}`
    };
    // Create signature string per PayFast docs (concatenate and md5/hash as required)
    const qs = Object.keys(pfData).map(k => `${k}=${encodeURIComponent(pfData[k])}`).join('&');
    // In production: sign using secret and send to PayFast URL. Here, return a demo URL.
    const demoUrl = `https://www.payfast.co.za/eng/process?${qs}`;
    res.json({ paymentUrl: demoUrl });
  } catch (err) {
    console.error('PayFast create error', err);
    res.status(500).json({ error: err.message });
  }
});

// PayFast notify/webhook handler (simplified)
// PayFast will POST payment data to your notify_url. Validate signature and update Firestore payment record accordingly.
app.post('/payments/payfast/webhook', async (req, res) => {
  try {
    const data = req.body;
    // TODO: validate signature per PayFast docs
    // Example: m_payment_id contains merchantId-orderId
    const mPaymentId = data.m_payment_id || '';
    const [merchantId, orderId] = mPaymentId.split('-');
    const status = data.payment_status || 'UNKNOWN';
    // Save webhook event to Firestore for reconciliation
    await db.collection('merchants').doc(merchantId).collection('orders').doc(orderId)
      .collection('payments').add({ provider: 'payfast', payload: data, receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    // Update order/payment status if needed
    if (status === 'COMPLETE') {
      await db.collection('merchants').doc(merchantId).collection('orders').doc(orderId).update({ status: 'paid' });
    }
    res.status(200).send('OK');
  } catch (err) {
    console.error('PayFast webhook error', err);
    res.status(500).send('ERR');
  }
});


// --- Yoco Payment Links example (server-side) ---
// Notes:
// * Use Yoco REST API: POST https://api.yoco.com/v1/payment_links with API key (test/live).
// * Store your API keys in functions config (`firebase functions:config:set yoco.key="..."`)
app.post('/payments/yoco/create-link', async (req, res) => {
  try {
    const apiKey = process.env.YOCO_KEY || functions.config().yoco?.key;
    if (!apiKey) return res.status(500).json({ error: 'Yoco API key not configured' });
    const { merchantId, orderId, amount, description } = req.body;
    // Build request to Yoco. In functions environment, use fetch or axios.
    const fetch = require('node-fetch');
    const body = { amount: Math.round(amount * 100), // cents
                   description: description || `Pezela order ${orderId}` };
    const resp = await fetch('https://api.yoco.com/v1/payment_links/', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    // Persist payment record and return link
    await db.collection('merchants').doc(merchantId).collection('orders').doc(orderId).collection('payments').add({
      provider: 'yoco',
      provider_response: data,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ link: data.checkout_url || data.url || data.payment_link || data });
  } catch (err) {
    console.error('Yoco create link error', err);
    res.status(500).json({ error: err.message });
  }
});

// Yoco webhook handler (example) - adjust per Yoco docs
app.post('/payments/yoco/webhook', async (req, res) => {
  try {
    const payload = req.body;
    // Validate webhook signature per Yoco docs (omitted here)
    // Example: find payment by provider id and reconcile
    const providerPaymentId = payload.id || payload.payment_id || payload.data?.id;
    // Save event
    await db.collection('webhookEvents').add({ provider: 'yoco', payload, receivedAt: admin.firestore.FieldValue.serverTimestamp() });
    // TODO: map to order and update status
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Yoco webhook error', err);
    res.status(500).json({ error: err.message });
  }
});


// --- Reconciliation utility (admin-only) ---
// Call this to scan unpaid orders and reconcile payments based on recorded payment docs.
app.post('/admin/reconcile-payments', async (req, res) => {
  try {
    // In production secure this endpoint (admin auth)
    const merchantsSnap = await db.collection('merchants').get();
    const results = [];
    for (const mdoc of merchantsSnap.docs) {
      const merchantId = mdoc.id;
      const ordersSnap = await db.collection('merchants').doc(merchantId).collection('orders').where('status','!=','paid').limit(50).get();
      for (const od of ordersSnap.docs) {
        const orderId = od.id;
        const paymentsSnap = await od.ref.collection('payments').get();
        let paid = false;
        paymentsSnap.forEach(p => {
          const pData = p.data();
          if (pData.status === 'complete' || pData.provider_response?.status === 'SUCCESS') paid = true;
        });
        if (paid) {
          await od.ref.update({ status: 'paid', reconciledAt: admin.firestore.FieldValue.serverTimestamp() });
          results.push({ merchantId, orderId, reconciled: true });
        }
      }
    }
    res.json({ results, count: results.length });
  } catch (err) {
    console.error('Reconcile error', err);
    res.status(500).json({ error: err.message });
  }
});
