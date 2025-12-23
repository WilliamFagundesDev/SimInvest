/**
 * Aba de Renda
 */
class IncomeTab {
    constructor(ui) { 
        this.ui = ui; 
        this.chart = null; 
        this.selectedIdx = null; 
    }

    calculateNextIncome(state) {
        const nextMonth = state.month;
        let total = 0;
        state.portfolio.forEach(p => {
            const asset = this.ui.game.market.assets.find(a => a.id === p.id);
            if (asset.type === 'FII' || asset.type === 'Ações') {
                let willPay = false;
                if (!asset.periodicity || asset.periodicity === 'mensal') willPay = true;
                else if (asset.periodicity === 'semestral' && nextMonth % 6 === 0) willPay = true;
                else if (asset.periodicity === 'anual' && nextMonth % 12 === 0) willPay = true;

                if (willPay) {
                    const impact = this.ui.game.market.activeImpacts[asset.sector] || 0;
                    total += (asset.baseDividend * (1 + impact)) * p.qty;
                }
            }
        });
        return total;
    }

    render(container, state) {
        const hist = state.incomeHistory || [];
        const sel = this.selectedIdx !== null ? hist[this.selectedIdx] : null;
        const nextIncome = this.calculateNextIncome(state);
        
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div class="chart-box"><h4>Dividendos (12m)</h4><canvas id="incomeChart"></canvas></div>
                <div class="space-y-6">
                    <div class="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[40px]">
                        <p class="text-xs text-blue-400 font-black uppercase tracking-widest mb-2 text-center">Acumulado em Dividendos (12m)</p>
                        <p class="text-4xl font-black text-white text-center">${this.ui.formatMoney(hist.reduce((a,c)=>a+c.total,0))}</p>
                    </div>
                    <div class="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px]">
                        <p class="text-xs text-emerald-400 font-black uppercase tracking-widest mb-2 text-center">Previsão Próximo Mês</p>
                        <p class="text-4xl font-black text-emerald-400 text-center">${this.ui.formatMoney(nextIncome)}</p>
                    </div>
                </div>
            </div>
            
            ${sel ? `
            <div class="p-8 bg-blue-600/10 rounded-[40px] border border-blue-600/20">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="font-black uppercase text-sm text-blue-400 tracking-widest">Detalhamento: Mês ${sel.month}</h3>
                    <span class="text-xs font-bold text-slate-500">Saldo Total: ${this.ui.formatMoney(sel.total)}</span>
                </div>
                
                <div class="space-y-3">
                    ${sel.details.map(d => {
                        const reinvested = d.reinvested;
                        return `
                        <div class="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-white">${d.name} (${d.qty} cotas)</span>
                                <span class="text-emerald-400 font-mono font-bold">+ ${this.ui.formatMoney(d.amount)}</span>
                            </div>
                            ${reinvested ? `
                            <div class="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                                    <span class="text-[10px] font-black text-blue-300 uppercase tracking-widest">Auto Re-investido: +${reinvested.qty} ${reinvested.qty > 1 ? 'cotas' : 'cota'}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-[10px] font-mono text-slate-400 block">Investido: -${this.ui.formatMoney(reinvested.cost)}</span>
                                    <span class="text-[10px] font-mono text-emerald-400 block font-bold">Sobrou em conta: +${this.ui.formatMoney(reinvested.leftover)}</span>
                                </div>
                            </div>
                            ` : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>` : `
            <div class="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                <p class="text-slate-500 font-bold italic">Selecione uma barra no gráfico para ver os detalhes de reinvestimento e proventos do mês.</p>
            </div>
            `}
        `;
        
        setTimeout(() => this.renderChart(hist), 100);
    }

    renderChart(h) {
        const ctx = document.getElementById('incomeChart')?.getContext('2d'); if (!ctx) return;
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, { 
            type: 'bar', 
            data: { 
                labels: h.map(x=>`Mês ${x.month}`), 
                datasets: [{ 
                    data: h.map(x=>x.total), 
                    backgroundColor: h.map((_,i)=>i===this.selectedIdx?'#3b82f6':'rgba(59, 130, 246, 0.4)'), 
                    borderRadius: 12 
                }] 
            }, 
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                onClick: (e, els) => { 
                    if (els.length) { 
                        this.selectedIdx = els[0].index; 
                        this.ui.render(); 
                    } 
                }, 
                plugins: { legend: { display: false } }, 
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, 
                    x: { grid: { display: false } } 
                } 
            } 
        });
    }
}