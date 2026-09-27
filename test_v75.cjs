const { IQRevenueLinker } = require('D:\\001-AGI\\engines\\v75_iq_revenue_linker.js');
const linker = new IQRevenueLinker();
linker.bus.on('IQ_INCREASE', (payload) => {
    console.log('IQ Increased:', payload);
});
linker.addRevenue(1500); // Should trigger an IQ increase to 110
console.log('Final IQ:', linker.currentIQ);
console.log('Test completed successfully.');
