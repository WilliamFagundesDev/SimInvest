/**
 * MARKET.JS
 * Responsabilidade: Lógica de volatilidade e geração de notícias.
 */

class MarketService {
    constructor() {
        this.assets = JSON.parse(JSON.stringify(GAME_DATA.MARKET));
        this.activeImpacts = {}; // { sectorName: impactValue }
    }

    generateNews() {
        const template = GAME_DATA.NEWS_TEMPLATES[Math.floor(Math.random() * GAME_DATA.NEWS_TEMPLATES.length)];
        this.activeImpacts[template.target] = template.impact;
        return template;
    }

    updateMarketCycle() {
        this.assets.forEach(asset => {
            const impact = this.activeImpacts[asset.sector] || 0;
            const randomVar = (Math.random() - 0.5) * asset.volatility;
            
            // Se tiver preço, varia o preço (Ações e FIIs)
            if (asset.price) {
                const changeFactor = 1 + randomVar + (impact * 0.4);
                asset.price *= changeFactor;
                if (asset.price < 0.01) asset.price = 0.01;
            }

            // Dissipação gradual do impacto da notícia
            if (this.activeImpacts[asset.sector]) {
                this.activeImpacts[asset.sector] *= 0.5;
            }
        });
    }

    calculateYield(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        const impact = this.activeImpacts[asset.sector] || 0;
        return asset.baseYield + (impact * 0.05);
    }
}