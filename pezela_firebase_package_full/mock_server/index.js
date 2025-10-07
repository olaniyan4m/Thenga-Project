const express = require('express');
const app = express();
app.use(express.json());

app.get('/ping', (req,res) => res.json({ok:true}));

// Mock PSP: create payment link
app.post('/psp/create-payment', (req,res) => {
  const id = Math.random().toString(36).slice(2,10);
  res.json({ paymentId: id, paymentLink: `https://pay.mock/${id}` });
});

// Mock WhatsApp send
app.post('/mock-whatsapp/send', (req,res) => {
  console.log('Mock WhatsApp message', req.body);
  res.json({ ok:true, messageId: Math.random().toString(36).slice(2,10) });
});

app.listen(4000, () => console.log('Mock server listening on http://localhost:4000'));
