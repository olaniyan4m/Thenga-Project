// Business App Data - Simulated dynamic content
const businessData = {
    dashboard: {
        totalOrders: 1247,
        totalRevenue: 45678.90,
        activeCustomers: 892,
        pendingPayments: 12
    },
    orders: [
        { id: 1, customer: "John Doe", amount: 299.99, status: "completed" },
        { id: 2, customer: "Jane Smith", amount: 149.50, status: "pending" },
        { id: 3, customer: "Bob Johnson", amount: 89.99, status: "processing" }
    ],
    analytics: {
        pageViews: 15420,
        uniqueVisitors: 3240,
        conversionRate: 3.2,
        averageOrderValue: 156.78
    }
};

// Export for use in service worker
if (typeof module !== 'undefined' && module.exports) {
    module.exports = businessData;
} else {
    window.businessData = businessData;
}