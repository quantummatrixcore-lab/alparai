/**
 * EU AI Act Compliance Auditor
 * Zero dependencies.
 */

class EUAIAuditEngine {
    constructor() {
        // EU AI Act Risk Categories (simplified thresholds for demonstration)
        this.riskThresholds = {
            UNACCEPTABLE_RISK: 90,
            HIGH_RISK: 60,
            LIMITED_RISK: 30,
            MINIMAL_RISK: 0
        };
    }

    /**
     * Mathematically analyze code for bias and black-box indicators
     * @param {string} codeContent - The AI architecture or code content
     * @returns {Object} compliance report
     */
    audit(codeContent) {
        if (!codeContent || typeof codeContent !== 'string') {
            throw new Error("Invalid input: codeContent must be a string");
        }

        let biasScore = 0;
        let blackBoxScore = 0;
        let reasons = [];

        const lowerCode = codeContent.toLowerCase();

        // 1. Analyze Bias Indicators (Heuristic approach)
        const biasKeywords = ['gender', 'race', 'ethnicity', 'religion', 'age_filter', 'unbalanced_dataset', 'exclude_minority'];
        let biasMatches = 0;
        biasKeywords.forEach(keyword => {
            if (lowerCode.includes(keyword)) {
                biasMatches++;
                reasons.push(`Potential bias indicator found: '${keyword}'`);
            }
        });
        biasScore += (biasMatches * 15);

        // 2. Analyze Black-box Risk Indicators
        const blackBoxKeywords = ['deep_neural_network', 'blackbox', 'unexplainable', 'hidden_layers', 'opaque_model', 'no_interpretability'];
        let blackBoxMatches = 0;
        blackBoxKeywords.forEach(keyword => {
            if (lowerCode.includes(keyword)) {
                blackBoxMatches++;
                reasons.push(`Black-box risk indicator found: '${keyword}'`);
            }
        });
        blackBoxScore += (blackBoxMatches * 20);

        // Calculate total risk score
        const totalRiskScore = Math.min(100, biasScore + blackBoxScore);
        
        let compliant = false;
        let blockInvestment = true;

        // If risk score is below HIGH_RISK threshold, it is considered compliant
        if (totalRiskScore < this.riskThresholds.HIGH_RISK) {
            compliant = true;
            blockInvestment = false;
        } else {
            reasons.push("EU AI Act Violation: System classified as High/Unacceptable Risk without sufficient safeguards.");
        }

        return {
            compliant,
            totalRiskScore,
            biasScore,
            blackBoxScore,
            blockInvestment,
            reasons
        };
    }
}

export { EUAIAuditEngine };
