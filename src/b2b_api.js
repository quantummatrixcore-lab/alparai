class B2BAPIManager {
    constructor(config = {}) {
        this.clients = new Map();
        // Configuration with defaults
        this.costPerCall = config.costPerCall || 0.01;
        this.costPerToken = config.costPerToken || 0.0001;
        this.rateLimit = config.rateLimit || 100; // max calls per time window
        this.timeWindowMs = config.timeWindowMs || 60000; // 1 minute default
    }

    _getClient(clientId) {
        if (!this.clients.has(clientId)) {
            this.clients.set(clientId, {
                calls: 0,
                tokens: 0,
                bill: 0,
                windowStart: Date.now()
            });
        }
        return this.clients.get(clientId);
    }

    processRequest(clientId, tokenCount = 0) {
        const now = Date.now();
        const client = this._getClient(clientId);

        // Reset rate limit window if passed
        if (now - client.windowStart > this.timeWindowMs) {
            client.calls = 0;
            client.windowStart = now;
        }

        // Check rate limit
        if (client.calls >= this.rateLimit) {
            return {
                success: false,
                error: 'Rate limit exceeded. Please try again later.'
            };
        }

        // Process request
        client.calls += 1;
        client.tokens += tokenCount;
        
        // Calculate cost for this request
        const requestCost = this.costPerCall + (tokenCount * this.costPerToken);
        client.bill += requestCost;

        return {
            success: true,
            usage: {
                callsInWindow: client.calls,
                totalTokens: client.tokens,
                currentBill: Number(client.bill.toFixed(4))
            }
        };
    }

    generateInvoice(clientId) {
        const client = this.clients.get(clientId);
        if (!client) {
            return { error: 'Client not found' };
        }
        return {
            clientId,
            totalTokens: client.tokens,
            totalBill: Number(client.bill.toFixed(4)),
            currency: 'USD' // default
        };
    }
}

export { B2BAPIManager };
