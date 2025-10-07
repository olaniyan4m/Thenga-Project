import React, {useEffect, useState} from 'react';
import localforage from 'localforage';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// TODO: replace with your Firebase config
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_ID',
  appId: 'YOUR_APP_ID'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App(){
  const [products, setProducts] = useState([]);
  useEffect(()=>{
    async function load(){
      // Example: load products for demo merchant 'demoMerchant'
      const q = collection(db, 'merchants/demoMerchant/products');
      const snap = await getDocs(q);
      setProducts(snap.docs.map(d=>({id:d.id, ...d.data()})));
    }
    load();
  },[]);
  return (
    <div style={{padding:20,fontFamily:'sans-serif'}}>
      <h1>Pezela PWA (Firebase)</h1>
      <p>Mobile-first product catalogue example (reads from Firestore)</p>
      <ul>
        {products.map(p=>(<li key={p.id}>{p.name} — R{p.price}</li>))}
      </ul>
    </div>
  );
}


import localforage from 'localforage';

// Initialize a simple local store for offline orders
localforage.config({ name: 'pezela_offline' });

async function saveOfflineOrder(order) {
  const orders = (await localforage.getItem('orders')) || [];
  orders.push({ ...order, createdAt: Date.now(), synced: false });
  await localforage.setItem('orders', orders);
  return orders.length;
}

async function syncOrders() {
  const orders = (await localforage.getItem('orders')) || [];
  const unsynced = orders.filter(o => !o.synced);
  for (const o of unsynced) {
    try {
      // POST to cloud functions API (replace base URL in production)
      const res = await fetch(`/api/merchants/demoMerchant/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(o)
      });
      if (res.ok) {
        o.synced = true;
      }
    } catch (err) {
      console.warn('Sync failed', err);
    }
  }
  await localforage.setItem('orders', orders);
  return orders.filter(o=>o.synced).length;
}

// Expose helpers on window for demo usage
window.PezelaOffline = { saveOfflineOrder, syncOrders };
