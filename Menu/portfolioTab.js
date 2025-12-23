/**
 * Aba de Portfólio
 * Atualizado: Inclusão de gráfico de alocação por Setor (Logística, Bancos, Mineração, etc.)
 */
class PortfolioTab {
    constructor(ui) { 
        this.ui = ui; 
        this.charts = []; 
    }

    render(container, state) {
        container.innerHTML = `
            <!-- Grid de Gráficos - Layout de 4 colunas -->
            <div class="portfolio-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div class="chart-box">
                    <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">Por Setor</h4>
                    <canvas id="sectorChart"></canvas>
                </div>
                <div class="chart-box">
                    <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">Classe Ativo</h4>
                    <canvas id="allocChart"></canvas>
                </div>
                <div class="chart-box">
                    <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">FIIs (Detalhamento)</h4>
                    <canvas id="fiiChart"></canvas>
                </div>
                <div class="chart-box">
                    <h4 class="text-[10px] font-black uppercase text-slate-500 mb-2">Ações (Detalhamento)</h4>
                    <canvas id="stockChart"></canvas>
                </div>
            </div>

            <!-- Listagem de Ativos -->
            <div class="space-y-4">
                <div class="flex items-center gap-4 mb-6">
                    <h3 class="text-xs font-black uppercase text-white tracking-[0.3em]">Meus Investimentos</h3>
                    <div class="h-px flex-1 bg-white/5"></div>
                </div>
                
                ${state.portfolio.length > 0 ? state.portfolio.map(p => {
                    const a = this.ui.game.market.assets.find(x => x.id === p.id);
                    if (!a) return '';
                    const currentVal = a.price ? a.price * p.qty : p.avgPrice;
                    const profit = currentVal - (p.principal || 0);
                    const profitPerc = p.principal > 0 ? (profit / p.principal) * 100 : 0;

                    return `
                    <div class="flex flex-col md:flex-row justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[32px] hover:border-blue-500/20 transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                ${a.type === 'FII' ? '🏢' : a.type === 'Ações' ? '📈' : '💵'}
                            </div>
                            <div>
                                <p class="font-black text-lg text-white">${a.name}</p>
                                <div class="flex gap-2 items-center">
                                    <span class="text-[8px] font-black uppercase text-slate-500">${a.sector}</span>
                                    <span class="text-[8px] font-bold text-slate-600">• ${p.qty.toFixed(0)} unidades</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center gap-8 mt-4 md:mt-0">
                            <div class="text-right">
                                <p class="text-[9px] font-black text-slate-500 uppercase">Patrimônio</p>
                                <p class="font-mono font-bold text-xl text-white">${this.ui.formatMoney(currentVal)}</p>
                            </div>
                            <div class="text-right border-l border-white/5 pl-8">
                                <p class="text-[9px] font-black text-slate-500 uppercase">Resultado</p>
                                <p class="font-mono font-bold text-sm ${profit >= 0 ? 'text-emerald-400' : 'text-red-500'}">
                                    ${profit >= 0 ? '+' : ''}${profitPerc.toFixed(2)}%
                                </p>
                            </div>
                            <button onclick="ui.tabs.portfolio.openSellModal('${p.id}')" class="p-4 hover:bg-red-500/10 rounded-2xl text-red-500 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </div>`;
                }).join('') : `
                <div class="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                    <p class="text-slate-600 font-bold italic">Sua carteira está vazia. Comece a investir na aba de Mercado!</p>
                </div>
                `}
            </div>`;

        setTimeout(() => this.renderCharts(state), 50);
    }

    renderCharts(s) {
        this.charts.forEach(c => c.destroy()); 
        this.charts = [];

        const types = { FII: 0, Ações: 0, RF: 0 };
        const sectors = {}; 
        const fiiDetails = {}; 
        const stockDetails = {};
        
        s.portfolio.forEach(p => {
            const a = this.ui.game.market.assets.find(x => x.id === p.id);
            if (!a) return;
            const v = a.price ? a.price * p.qty : p.avgPrice;
            
            // 1. Agrupamento por Classe
            if (a.type === 'FII') types.FII += v;
            else if (a.type === 'Ações') types.Ações += v;
            else types.RF += v;

            // 2. Agrupamento por Setor (Requisitado)
            const sectorName = a.sector || 'Governo';
            sectors[sectorName] = (sectors[sectorName] || 0) + v;

            // 3. Detalhes específicos
            if (a.type === 'FII') fiiDetails[a.name] = (fiiDetails[a.name] || 0) + v;
            if (a.type === 'Ações') stockDetails[a.name] = (stockDetails[a.name] || 0) + v;
        });

        const makeDoughnut = (id, labels, values, colors) => {
            const canv = document.getElementById(id);
            if (!canv || values.every(v => v === 0)) return;
            this.charts.push(new Chart(canv, { 
                type: 'doughnut', 
                data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }] }, 
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    cutout: '70%', 
                    plugins: { 
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => {
                                    const val = ctx.raw;
                                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                                    const perc = ((val / total) * 100).toFixed(1);
                                    return ` ${ctx.label}: ${perc}%`;
                                }
                            }
                        }
                    } 
                } 
            }));
        };

        // Paleta de cores para os setores
        const sectorColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

        // Renderização dos 4 gráficos
        makeDoughnut('sectorChart', Object.keys(sectors), Object.values(sectors), sectorColors);
        makeDoughnut('allocChart', ['FII', 'Ação', 'R. Fixa'], [types.FII, types.Ações, types.RF], ['#8b5cf6', '#3b82f6', '#10b981']);
        makeDoughnut('fiiChart', Object.keys(fiiDetails), Object.values(fiiDetails), ['#9D50FF', '#FF4DB2', '#00E676', '#FF9100']);
        makeDoughnut('stockChart', Object.keys(stockDetails), Object.values(stockDetails), ['#00E5FF', '#F50057', '#651FFF', '#76FF03']);
    }

    openSellModal(id) {
        const a = this.ui.game.market.assets.find(x => x.id === id);
        const p = this.ui.game.state.portfolio.find(x => x.id === id);
        if (!p) return;

        const isRF = ['Tesouro', 'CDB', 'LCI/LCA'].includes(a.type);
        const msg = isRF ? `Quanto deseja resgatar? (Saldo: ${this.ui.formatMoney(p.avgPrice)})` : `Quantas cotas deseja vender? (Possui: ${p.qty})`;
        const q = prompt(msg);
        
        if (q && !isNaN(parseFloat(q))) {
            if (this.ui.game.sellAsset(id, parseFloat(q))) {
                this.ui.render();
            } else {
                this.ui.showModal("Erro na Venda", "Quantidade ou valor inválido.");
            }
        }
    }
}