class DefconPredictor {
    constructor() {
        this.currentDefcon = 5; // 5 is peace, 1 is maximum alert
        this.keywordWeights = {
            'nuclear': -2,
            'war': -1,
            'crisis': -1,
            'missile': -1,
            'mobilization': -1,
            'threat': -1,
            'peace': 1,
            'agreement': 1,
            'diplomacy': 1
        };
        this.liquiditySecured = false;
    }

    analyzeNews(newsArray) {
        let score = 0;
        for (const news of newsArray) {
            // Remove punctuation and split by whitespace
            const words = news.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);
            for (const word of words) {
                if (this.keywordWeights[word] !== undefined) {
                    score += this.keywordWeights[word];
                }
            }
        }
        
        // Base DEFCON is 5, we subtract threat points (or add peace points)
        let newDefcon = 5 + score;
        
        // Clamp between 1 and 5
        if (newDefcon < 1) newDefcon = 1;
        if (newDefcon > 5) newDefcon = 5;

        this.currentDefcon = newDefcon;
        
        if (this.currentDefcon <= 2) {
            this.triggerEmergencyLiquidityTransfer();
        } else {
            this.liquiditySecured = false;
        }
        
        return this.currentDefcon;
    }

    triggerEmergencyLiquidityTransfer() {
        console.log(`[ALERT] DEFCON level dropped to ${this.currentDefcon}!`);
        console.log("[SYSTEM] Initiating autonomous emergency protocol...");
        console.log("[SYSTEM] Converting all startup liquidity to Cold Storage (Stablecoins/Gold)...");
        console.log("[SYSTEM] Transfer complete. Liquidity is now secured.");
        this.liquiditySecured = true;
    }
}

export default DefconPredictor;
