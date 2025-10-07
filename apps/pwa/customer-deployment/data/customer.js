// Customer App Data - Simulated dynamic content
const customerData = {
    profile: {
        name: "John Doe",
        email: "john@example.com",
        loyaltyPoints: 1250,
        memberSince: "2023-01-15"
    },
    orders: [
        { id: 1, product: "Wireless Headphones", amount: 299.99, status: "delivered" },
        { id: 2, product: "Smart Watch", amount: 199.99, status: "shipped" },
        { id: 3, product: "Laptop Stand", amount: 49.99, status: "processing" }
    ],
    cart: [
        { id: 1, product: "Phone Case", price: 29.99, quantity: 2 },
        { id: 2, product: "Screen Protector", price: 19.99, quantity: 1 }
    ],
    favorites: [
        { id: 1, product: "Gaming Mouse", price: 79.99 },
        { id: 2, product: "Mechanical Keyboard", price: 129.99 }
    ]
};

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = customerData;
} else {
    window.customerData = customerData;
}