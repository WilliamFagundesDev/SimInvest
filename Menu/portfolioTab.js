/**
 * Aba de Portfólio
 */
class PortfolioTab {
    constructor(ui) { this.ui = ui; this.charts = []; }

    render(container, state) {
        container.innerHTML = `
            <div class="portfolio-grid">
                <div class="chart-box"><h4>Divisão por Classe</h4><canvas id="allocChart"></canvas></div>
                <div class="chart-box"><h4>Ativos FII</h4><canvas id="fiiChart"></canvas></div>
                <div class="chart-box"><h4>Ativos Ações</h4><canvas id="stockChart"></canvas></div>
            </div>
            <div class="space-y-4">
                ${state.portfolio.map(p => {
                    const a = this.ui.game.market.assets.find(x => x.id === p.id);
                    const val = a.price ? a.price * p.qty : p.avgPrice;
                    return `<div class="flex justify-between p-6 bg-white/5 border border-white/5 rounded-3xl">
                        <div><p class="font-black text-xl">${a.name}</p>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${p.qty.toFixed(0)} COTAS • REND: ${(this.ui.game.market.calculateYield(a.id)*100).toFixed(2)}%</p></div>
                        <div class="text-right"><p class="font-mono font-bold text-blue-400 text-xl">${this.ui.formatMoney(val)}</p>
                        <button onclick="ui.tabs.portfolio.sell('${p.id}')" class="text-[10px] text-red-500 font-black uppercase underline mt-1">Vender</button></div>
                    </div>`; }).join('')}
            </div>`;
        setTimeout(() => this.renderCharts(state), 100);
    }

    renderCharts(s) {
        this.charts.forEach(c => c.destroy()); this.charts = [];
        const types = { FII: 0, Stock: 0, RF: 0 };
        const fii = {}; const stock = {};
        
        s.portfolio.forEach(p => {
            const a = this.ui.game.market.assets.find(x => x.id === p.id);
            const v = a.price ? a.price * p.qty : p.avgPrice;
            if (a.type==='FII') { types.FII += v; fii[a.name] = (fii[a.name] || 0) + v; }
            else if (a.type==='Ações') { types.Stock += v; stock[a.name] = (stock[a.name] || 0) + v; }
            else types.RF += v;
        });

        const make = (id, labels, values, colors) => {
            const canv = document.getElementById(id); if (!canv) return;
            this.charts.push(new Chart(canv, { type: 'doughnut', data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#fff', padding: 15, font: { size: 10 } } } } } }));
        };

        if (types.FII || types.Stock || types.RF) make('allocChart', ['FIIs', 'Ações', 'RF'], [types.FII, types.Stock, types.RF], ['#8b5cf6', '#3b82f6', '#10b981']);
        if (Object.keys(fii).length) make('fiiChart', Object.keys(fii), Object.values(fii), ['#9D50FF', '#FF4DB2', '#00E676', '#FF9100', '#2979FF']);
        if (Object.keys(stock).length) make('stockChart', Object.keys(stock), Object.values(stock), ['#00E5FF', '#F50057', '#651FFF', '#FFEA00', '#1DE9B6']);
    }

    sell(id) {
        const a = this.ui.game.market.assets.find(x => x.id === id);
        const q = prompt(['Tesouro', 'CDB', 'LCI/LCA'].includes(a.type) ? 'Valor em R$:' : 'Quantidade de Cotas:');
        if (q && this.ui.game.sellAsset(id, parseFloat(q))) this.ui.render();
    }
}