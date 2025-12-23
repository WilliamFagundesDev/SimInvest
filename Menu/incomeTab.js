/**
 * Aba de Renda
 * Responsabilidade: Exibir projeções e histórico detalhado de ganhos.
 * Atualizado: Exibição do valor GASTO no auto-reinvestimento de FIIs e Ações.
 */
class IncomeTab {
    constructor(ui) { 
        this.ui = ui; 
        this.chart = null; 
        this.selectedIdx = null; 
    }

    /**
     * Calcula a estimativa de ganhos para o próximo mês com base no estado atual.
     */
    calculateNextIncome(state) {
        const nextMonth = state.month;
        let salary = 0;
        let rentals = 0;
        let fixedInvestments = 0;
        let dividends = 0;

        // 1. Salário Base + Bônus de Fidelidade
        if (state.jobId) {
            const job = GAME_DATA.JOBS.find(j => j.id === state.jobId);
            if (job) {
                const bonus = this.ui.game.calculateSalaryBonus();
                salary = job.salary * (1 + bonus);
            }
        }

        // 2. Rendimento de Aluguéis (0.5% ao mês)
        state.ownedAssets.houses.forEach(h => {
            if (h.isRented && h.vacancyRemaining === 0) {
                const data = GAME_DATA.PROPERTIES.find(p => p.id === h.id);
                if (data) rentals += data.price * 0.005;
            }
        });

        // 3. Rendimentos de Investimentos
        state.portfolio.forEach(p => {
            const asset = this.ui.game.market.assets.find(a => a.id === p.id);
            if (!asset) return;
            const impact = this.ui.game.market.activeImpacts[asset.sector] || 0;

            if (['Tesouro', 'CDB', 'LCI/LCA'].includes(asset.type)) {
                // Projeção de Juros de Renda Fixa
                const yieldRate = this.ui.game.market.calculateYield(p.id);
                fixedInvestments += p.avgPrice * yieldRate;
            } else if (asset.type === 'FII' || asset.type === 'Ações') {
                // Projeção de Dividendos de Renda Variável
                let willPay = false;
                if (!asset.periodicity || asset.periodicity === 'mensal') willPay = true;
                else if (asset.periodicity === 'semestral' && nextMonth % 6 === 0) willPay = true;
                else if (asset.periodicity === 'anual' && nextMonth % 12 === 0) willPay = true;
                
                if (willPay) dividends += (asset.baseDividend * (1 + impact)) * p.qty;
            }
        });

        return { salary, rentals, fixedInvestments, dividends, total: salary + rentals + fixedInvestments + dividends };
    }

    render(container, state) {
        const hist = state.incomeHistory || [];
        const sel = this.selectedIdx !== null ? hist[this.selectedIdx] : null;
        const projection = this.calculateNextIncome(state);
        const hasAutoPay = state.upgrades.includes('auto_pay');
        
        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <!-- Painel de Projeção -->
                <div class="lg:col-span-1 space-y-4">
                    <div class="bg-slate-900/60 p-6 rounded-[32px] border border-white/5 relative overflow-hidden">
                        ${hasAutoPay ? `
                        <div class="absolute top-4 right-4 flex items-center gap-1.5 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            <span class="text-[8px] font-black text-blue-400 uppercase">Auto-Pay ON</span>
                        </div>
                        ` : ''}
                        
                        <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-4">Projeção Próximo Mês</p>
                        <div class="space-y-2">
                            <div class="flex justify-between text-[11px] font-bold">
                                <span class="text-slate-500">Trabalho/Imóveis:</span>
                                <span class="text-white">${this.ui.formatMoney(projection.salary + projection.rentals)}</span>
                            </div>
                            <div class="flex justify-between text-[11px] font-bold">
                                <span class="text-slate-500">Renda Fixa:</span>
                                <span class="text-blue-400">${this.ui.formatMoney(projection.fixedInvestments)}</span>
                            </div>
                            <div class="flex justify-between text-[11px] font-bold border-b border-white/5 pb-2">
                                <span class="text-slate-500">Proventos (FII/Ações):</span>
                                <span class="text-emerald-400">${this.ui.formatMoney(projection.dividends)}</span>
                            </div>
                            <div class="flex justify-between items-center pt-2">
                                <span class="text-[10px] font-black uppercase text-white">Total Previsto</span>
                                <span class="text-2xl font-black text-white">${this.ui.formatMoney(projection.total)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="bg-blue-600/10 p-6 rounded-[32px] border border-blue-600/20 text-center">
                        <p class="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Acumulado Total (12m)</p>
                        <p class="text-2xl font-black text-white">${this.ui.formatMoney(hist.reduce((a,c)=>a+c.total,0))}</p>
                    </div>
                </div>

                <!-- Gráfico de Evolução -->
                <div class="lg:col-span-2 chart-box">
                    <h4 class="text-[10px] font-black uppercase text-slate-500 mb-4">Histórico de Proventos (FII e Ações)</h4>
                    <canvas id="dividendChart"></canvas>
                </div>
            </div>

            ${sel ? `
            <div class="space-y-8 animate-in fade-in duration-500">
                <!-- Cabeçalho do Mês Selecionado -->
                <div class="bg-emerald-500/10 p-8 rounded-[40px] border border-emerald-500/20 flex justify-between items-center">
                    <div>
                        <h5 class="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Extrato Consolidado</h5>
                        <p class="text-white font-black text-xl">Mês de Referência: ${sel.month}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Líquido Recebido</p>
                        <p class="text-4xl font-black text-emerald-400 font-mono">${this.ui.formatMoney(sel.total)}</p>
                    </div>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <!-- Renda Variável -->
                    <div class="space-y-4">
                        <h5 class="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] px-2">Proventos Variáveis</h5>
                        ${sel.details.filter(d => d.type === 'dividend' && !d.isFixed).length > 0 ? 
                            sel.details.filter(d => d.type === 'dividend' && !d.isFixed).map(d => this.renderIncomeRow(d)).join('') :
                            '<p class="text-[10px] text-slate-600 italic px-2">Sem dividendos.</p>'
                        }
                    </div>
                    <!-- Renda Fixa -->
                    <div class="space-y-4">
                        <h5 class="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] px-2">Renda Fixa</h5>
                        ${sel.details.filter(d => d.type === 'dividend' && d.isFixed).length > 0 ? 
                            sel.details.filter(d => d.type === 'dividend' && d.isFixed).map(d => this.renderIncomeRow(d)).join('') :
                            '<p class="text-[10px] text-slate-600 italic px-2">Sem juros.</p>'
                        }
                    </div>
                    <!-- Trabalho e Imóveis -->
                    <div class="space-y-4">
                        <h5 class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Trabalho & Bens</h5>
                        ${sel.details.filter(d => d.type !== 'dividend').length > 0 ? 
                            sel.details.filter(d => d.type !== 'dividend').map(d => this.renderIncomeRow(d)).join('') :
                            '<p class="text-[10px] text-slate-600 italic px-2">Sem outras rendas.</p>'
                        }
                    </div>
                </div>
            </div>` : `
            <div class="p-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                <p class="text-slate-500 font-bold italic">Clique nas barras do gráfico para ver o Total Recebido e o detalhamento do mês.</p>
            </div>`}
        `;
        
        setTimeout(() => this.renderChart(hist), 50);
    }

    /**
     * Renderiza cada linha de rendimento no extrato.
     */
    renderIncomeRow(d) {
        const reinvested = d.reinvested;
        const bonus = d.bonus;
        const isFixedIncome = d.isFixed;

        return `
        <div class="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-bold text-white text-sm">${d.name} ${d.qty ? `(${d.qty.toFixed(0)})` : ''}</span>
                    ${bonus ? `<span class="block text-[8px] text-emerald-400 font-black uppercase">Fidelidade: ${bonus}</span>` : ''}
                    ${isFixedIncome ? `<span class="block text-[8px] text-blue-400 font-black uppercase">Juros Reinvestidos</span>` : ''}
                </div>
                <span class="text-emerald-400 font-mono font-bold text-sm">+ ${this.ui.formatMoney(d.amount)}</span>
            </div>
            
            ${reinvested ? `
            <div class="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <p class="text-[9px] font-black text-blue-300 uppercase tracking-widest">
                        Reinvestido: +${reinvested.qty} ${reinvested.qty > 1 ? 'cotas' : 'cota'}
                    </p>
                </div>
                <div class="flex justify-between items-center pl-3">
                    <p class="text-[9px] text-slate-500 font-bold uppercase">Gasto na compra:</p>
                    <p class="text-[10px] text-red-400 font-mono font-bold">-${this.ui.formatMoney(reinvested.cost)}</p>
                </div>
                <div class="flex justify-between items-center pl-3">
                    <p class="text-[9px] text-slate-500 font-bold uppercase">Saldo Residual:</p>
                    <p class="text-[10px] text-emerald-400 font-mono font-bold">+${this.ui.formatMoney(reinvested.leftover)}</p>
                </div>
            </div>` : ''}
        </div>`;
    }

    /**
     * Renderiza o gráfico de barras de proventos recebidos.
     */
    renderChart(h) {
        const ctx = document.getElementById('dividendChart')?.getContext('2d'); if (!ctx) return;
        if (this.chart) this.chart.destroy();

        const dividendOnlyHistory = h.map(m => 
            m.details.filter(d => d.type === 'dividend' && !d.isFixed)
                     .reduce((acc, curr) => acc + curr.amount, 0)
        );

        this.chart = new Chart(ctx, { 
            type: 'bar', 
            data: { 
                labels: h.map(x=>`Mês ${x.month}`), 
                datasets: [{ 
                    data: dividendOnlyHistory, 
                    backgroundColor: h.map((_,i)=>i===this.selectedIdx?'#8b5cf6':'rgba(139, 92, 246, 0.3)'), 
                    borderRadius: 12 
                }] 
            }, 
            options: { 
                responsive: true, maintainAspectRatio: false,
                onClick: (e, els) => { if (els.length) { this.selectedIdx = els[0].index; this.ui.render(); } },
                plugins: { legend: { display: false } },
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#64748b', font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } }
                } 
            } 
        });
    }
}