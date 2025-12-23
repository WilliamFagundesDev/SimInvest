/**
 * Aba de Renda
 */
class IncomeTab {
    constructor(ui) { this.ui = ui; this.chart = null; this.selectedIdx = null; }

    render(container, state) {
        const hist = state.incomeHistory || [];
        const sel = this.selectedIdx !== null ? hist[this.selectedIdx] : null;
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div class="chart-box"><h4>Dividendos (12m)</h4><canvas id="incomeChart"></canvas></div>
                <div class="space-y-6">
                    <div class="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[40px]">
                        <p class="text-xs text-blue-400 font-black uppercase tracking-widest mb-2">Acumulado (12m)</p>
                        <p class="text-4xl font-black text-white">${this.ui.formatMoney(hist.reduce((a,c)=>a+c.total,0))}</p>
                    </div>
                </div>
            </div>
            ${sel ? `<div class="p-8 bg-blue-600/10 rounded-3xl border border-blue-600/20">
                <h3 class="font-black uppercase mb-4 text-sm text-center">Mês ${sel.month}</h3>
                ${sel.details.map(d => `<div class="flex justify-between p-3 border-b border-white/5 text-sm"><span>${d.name}</span><span class="text-emerald-400 font-bold">+ ${this.ui.formatMoney(d.amount)}</span></div>`).join('')}
            </div>` : ''}`;
        setTimeout(() => this.renderChart(hist), 100);
    }

    renderChart(h) {
        const ctx = document.getElementById('incomeChart')?.getContext('2d'); if (!ctx) return;
        if (this.chart) this.chart.destroy();
        this.chart = new Chart(ctx, { type: 'bar', data: { labels: h.map(x=>`Mês ${x.month}`), datasets: [{ data: h.map(x=>x.total), backgroundColor: h.map((_,i)=>i===this.selectedIdx?'#3b82f6':'rgba(59,130,246,0.4)'), borderRadius: 12 }] }, options: { responsive: true, maintainAspectRatio: false, onClick: (e, els) => { if (els.length) { this.selectedIdx = els[0].index; this.ui.render(); } }, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } } });
    }
}