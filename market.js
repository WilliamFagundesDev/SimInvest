/**
 * MARKET.JS
 * Responsabilidade: Lógica de volatilidade e geração de notícias.
 * Adicionado: Rastreio de lastChange para exibir as setas na UI.
 */

class MarketService {
    constructor() {
        this.assets = JSON.parse(JSON.stringify(GAME_DATA.MARKET));
        this.activeImpacts = {}; // { sectorName: impactValue }
        
        // Inicializa a variação para evitar erros de undefined
        this.assets.forEach(a => a.lastChange = 0);
    }

    generateNews() {
        const template = GAME_DATA.NEWS_TEMPLATES[Math.floor(Math.random() * GAME_DATA.NEWS_TEMPLATES.length)];
        this.activeImpacts[template.target] = template.impact;
        return template;
    }

    updateMarketCycle() {
        this.assets.forEach(asset => {
            const impact = this.activeImpacts[asset.sector] || 0;
            // Flutuação natural (ruído do mercado) solicitada por você
            const randomVar = (Math.random() - 0.5) * asset.volatility;
            
            if (asset.price) {
                // Cálculo da variação total: Notícia + Volatilidade Aleatória
                const totalVariation = randomVar + (impact * 0.4);
                const changeFactor = 1 + totalVariation;
                
                asset.price *= changeFactor;
                
                // SALVA A VARIAÇÃO PARA A ABA DE MERCADO USAR
                asset.lastChange = totalVariation;
                
                if (asset.price < 0.01) asset.price = 0.01;
            } else {
                // Para ativos de Renda Fixa (sem preço direto)
                asset.lastChange = (impact * 0.05) + (Math.random() - 0.5) * 0.0005;
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