/**
 * UI.JS
 * Responsabilidade: Manipular o DOM com foco em Dashboard Financeiro, Analytics e Legibilidade.
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'market';
        this.tradeModalAssetId = null;
        this.incomeChart = null;
        this.portfolioCharts = []; 
        this.selectedHistoryIndex = null;
        this.tradeMode = 'quantity'; // 'quantity' ou 'value'
        this.initEventListeners();
        this.injectCustomStyles();
    }

    injectCustomStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .modal-trade-active { display: flex !important; }
            .badge-fii { background: #8b5cf6; color: white; }
            .badge-stock { background: #3b82f6; color: white; }
            .badge-rf { background: #10b981; color: white; }
            .card-bill { border-left: 6px solid #f87171; background: rgba(255, 255, 255, 0.02); }
            .tab-btn.active { color: #3b82f6; border-bottom: 3px solid #3b82f6; background: rgba(59, 130, 246, 0.1); }
            
            #news-feed {
                max-height: 80vh;
                overflow-y: auto;
                padding-right: 12px;
            }
            .news-article {
                background: rgba(255, 255, 255, 0.04);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.08);
                overflow: hidden;
                margin-bottom: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.4);
            }
            .news-image { width: 100%; height: 180px; position: relative; }
            .news-image img { width: 100%; height: 100%; object-fit: cover; }
            
            .impact-label {
                position: absolute;
                top: 15px;
                right: 15px;
                padding: 8px 16px;
                border-radius: 14px;
                font-size: 12px;
                font-weight: 900;
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.2);
            }
            .impact-pos { background: rgba(16, 185, 129, 0.9); color: white; }
            .impact-neg { background: rgba(239, 68, 68, 0.9); color: white; }
            
            .news-content { padding: 1.5rem; }
            .news-title { font-size: 1.3rem; font-weight: 900; color: white; margin-bottom: 0.75rem; }
            .news-description { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }

            .earnings-report {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
                border: 1px solid rgba(16, 185, 129, 0.3);
            }

            .assets-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 2rem;
            }
            .asset-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 28px;
                padding: 1.5rem;
            }
            .asset-img {
                width: 100%;
                height: 150px;
                background: #0f172a;
                border-radius: 20px;
                margin-bottom: 1rem;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .asset-img img { width: 100%; height: 100%; object-fit: cover; }

            .portfolio-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            .chart-box {
                background: rgba(255, 255, 255, 0.02);
                border-radius: 32px;
                padding: 2rem;
                height: 440px;
                display: flex;
                flex-direction: column;
                border: 1px solid rgba(255,255,255,0.05);
            }
            .chart-box h4 { font-size: 12px; font-weight: 800; color: #cbd5e1; text-transform: uppercase; text-align: center; margin-bottom: 1rem; }

            .perf-card {
                background: rgba(255, 255, 255, 0.03);
                border-radius: 24px;
                padding: 1.5rem;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .profit-text { color: #10b981; font-weight: 800; }
            .loss-text { color: #ef4444; font-weight: 800; }

            .trade-mode-btn {
                flex: 1;
                padding: 8px;
                font-size: 10px;
                font-weight: 800;
                border-radius: 12px;
                background: rgba(255,255,255,0.05);
                color: #64748b;
                transition: all 0.2s;
            }
            .trade-mode-btn.active {
                background: #3b82f6;
                color: white;
            }

            @media (max-width: 1024px) {
                .portfolio-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

    initEventListeners() {
        document.getElementById('btn-next-month').onclick = () => {
            const res = this.game.nextMonth();
            if (res === "GAME_OVER") return this.handleGameOver();
            this.render();
        };

        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.onclick = (e) => {
                this.currentTab = e.currentTarget.getAttribute('data-tab');
                this.render();
            };
        });

        document.getElementById('modal-close').onclick = () => {
            document.getElementById('modal-overlay').classList.add('hidden');
        };

        this.ensureTradeModalInDOM();
        this.addDevTools();
    }

    handleGameOver() {
        this.showModal("FALÊNCIA TOTAL", "Suas dívidas atingiram 100% de juros. Recomeçando...");
        setTimeout(() => this.handleFullReset(true), 4000);
    }

    addDevTools() {
        const sidebar = document.querySelector('aside');
        if (sidebar && !document.getElementById('dev-reset')) {
            const btn = document.createElement('button');
            btn.id = 'dev-reset';
            btn.className = 'dev-reset-btn';
            btn.innerHTML = '🔄 Reiniciar Tudo';
            btn.onclick = () => this.handleFullReset();
            sidebar.appendChild(btn);
        }
    }

    async handleFullReset(silent = false) {
        if (silent || confirm("Isso apagará seu progresso. Confirmar?")) {
            const req = indexedDB.deleteDatabase('SimInvest_LocalDB');
            req.onsuccess = () => location.reload();
        }
    }

    ensureTradeModalInDOM() {
        if (document.getElementById('trade-modal')) return;
        const html = `
            <div id="trade-modal" class="hidden fixed inset-0 bg-black/95 backdrop-blur-md z-[250] flex items-center justify-center p-4">
                <div class="card-glass max-w-sm w-full p-10 rounded-[40px] border border-white/10">
                    <h3 id="trade-title" class="text-2xl font-black mb-1">Negociar</h3>
                    <p id="trade-asset-info" class="text-slate-500 text-[10px] mb-6 uppercase"></p>
                    
                    <!-- Seletor de Modo de Compra -->
                    <div id="trade-mode-container" class="flex gap-2 mb-6 bg-white/5 p-1 rounded-15">
                        <button onclick="ui.setTradeMode('quantity')" id="mode-qty" class="trade-mode-btn active">COTAS</button>
                        <button onclick="ui.setTradeMode('value')" id="mode-val" class="trade-mode-btn">VALOR (R$)</button>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <label id="trade-input-label" class="text-[10px] text-slate-400 block mb-2 font-bold uppercase">Quantidade</label>
                            <input type="number" id="trade-amount-input" class="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-mono text-white outline-none" placeholder="0">
                        </div>
                        <div class="bg-blue-500/10 p-5 rounded-3xl border border-blue-500/20 text-center">
                            <p id="trade-result-label" class="text-[10px] text-blue-400 font-black uppercase mb-1">Total da Operação</p>
                            <p id="trade-total-display" class="text-2xl font-mono font-bold">R$ 0,00</p>
                        </div>
                        <div class="flex gap-4">
                            <button id="trade-cancel" class="flex-1 py-5 bg-slate-900 rounded-2xl font-black text-xs">VOLTAR</button>
                            <button id="trade-confirm" class="flex-1 py-5 bg-emerald-600 rounded-2xl font-black text-xs">CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('trade-cancel').onclick = () => this.closeTradeModal();
        document.getElementById('trade-amount-input').oninput = (e) => this.updateTradeTotal(e.target.value);
    }

    setTradeMode(mode) {
        this.tradeMode = mode;
        const asset = this.game.market.assets.find(a => a.id === this.tradeModalAssetId);
        
        document.getElementById('mode-qty').classList.toggle('active', mode === 'quantity');
        document.getElementById('mode-val').classList.toggle('active', mode === 'value');
        
        const label = document.getElementById('trade-input-label');
        const resLabel = document.getElementById('trade-result-label');
        
        if (mode === 'quantity') {
            label.innerText = 'QUANTIDADE DE COTAS';
            resLabel.innerText = 'TOTAL DA OPERAÇÃO';
        } else {
            label.innerText = 'VALOR EM REAIS (R$)';
            resLabel.innerText = 'COTAS ESTIMADAS';
        }
        
        document.getElementById('trade-amount-input').value = "";
        document.getElementById('trade-total-display').innerText = mode === 'quantity' ? "R$ 0,00" : "0 cotas";
    }

    openTradeModal(assetId) {
        this.tradeModalAssetId = assetId;
        const asset = this.game.market.assets.find(a => a.id === assetId);
        const isRF = ['Tesouro', 'CDB', 'LCI/LCA'].includes(asset.type);

        document.getElementById('trade-title').innerText = asset.name;
        document.getElementById('trade-asset-info').innerText = `${asset.type} • ${asset.sector}`;
        
        // Esconde seletor para Renda Fixa (sempre por valor)
        document.getElementById('trade-mode-container').style.display = isRF ? 'none' : 'flex';
        
        this.setTradeMode(isRF ? 'value' : 'quantity');
        
        document.getElementById('trade-modal').classList.add('modal-trade-active');
        document.getElementById('trade-confirm').onclick = () => {
            const inputVal = parseFloat(document.getElementById('trade-amount-input').value);
            if (!inputVal || inputVal <= 0) return;

            let finalQty = inputVal;
            if (!isRF && this.tradeMode === 'value') {
                // Se for por valor, calcula o máximo de cotas
                finalQty = Math.floor(inputVal / asset.price);
            }

            if (finalQty > 0 && this.game.buyAsset(this.tradeModalAssetId, finalQty)) {
                this.closeTradeModal();
                this.render();
            } else { 
                this.showModal("Aviso", "Saldo insuficiente ou valor de cotas inválido."); 
            }
        };
    }

    updateTradeTotal(val) {
        const asset = this.game.market.assets.find(a => a.id === this.tradeModalAssetId);
        const inputVal = parseFloat(val) || 0;
        const display = document.getElementById('trade-total-display');

        if (this.tradeMode === 'quantity') {
            const tot = asset.price ? asset.price * inputVal : inputVal;
            display.innerText = this.formatMoney(tot);
        } else {
            if (asset.price) {
                const qty = Math.floor(inputVal / asset.price);
                display.innerText = `${qty} cotas`;
            } else {
                display.innerText = this.formatMoney(inputVal);
            }
        }
    }

    closeTradeModal() { document.getElementById('trade-modal').classList.remove('modal-trade-active'); }

    showModal(title, body) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerText = body;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    formatMoney(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

    render() {
        const s = this.game.state;
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        document.getElementById('display-date').innerText = `${months[(s.month-1)%12]} • Ano ${Math.floor((s.month-1)/12)+1}`;
        document.getElementById('display-balance').innerText = this.formatMoney(s.balance);

        let eq = s.balance;
        s.portfolio.forEach(p => { const a = this.game.market.assets.find(x => x.id === p.id); eq += a.price ? a.price * p.qty : p.avgPrice; });
        document.getElementById('display-equity').innerText = this.formatMoney(eq);

        const job = GAME_DATA.JOBS.find(j => j.id === s.jobId);
        document.getElementById('display-job').innerText = job ? job.name : "Desempregado";
        document.getElementById('display-edu').innerText = s.degrees[s.degrees.length-1];

        if (s.currentEducation) {
            const ed = GAME_DATA.EDUCATION.find(e => e.id === s.currentEducation.id);
            const perc = (s.currentEducation.progress / ed.duration) * 100;
            document.getElementById('edu-progress-wrapper').classList.remove('hidden');
            document.getElementById('edu-perc').innerText = `${Math.round(perc)}%`;
            document.getElementById('edu-bar').style.width = `${perc}%`;
        } else document.getElementById('edu-progress-wrapper').classList.add('hidden');

        let newsHtml = '';
        const lastIncome = s.incomeHistory[s.incomeHistory.length - 1];
        if (lastIncome && lastIncome.details && lastIncome.details.length > 0) {
            const fiiDetails = lastIncome.details.map(d => {
                const yieldPerCota = d.amount / d.qty;
                return `<li><strong>${d.name}</strong>: pagou <strong>${this.formatMoney(yieldPerCota)}</strong> p/ cota (${d.qty} cotas).</li>`;
            }).join('');
            newsHtml += `<article class="news-article earnings-report"><div class="news-content"><span class="news-date">Relatório Mensal</span><h3 class="news-title">Ficheiro de Proventos</h3><ul class="text-xs text-slate-300 mt-4 space-y-2 list-disc pl-5">${fiiDetails}</ul></div></article>`;
        }
        newsHtml += s.newsHistory.slice(0, 10).map(n => {
            const isPos = n.type === 'pos';
            return `<article class="news-article"><div class="news-image"><img src="${n.local}" onerror="this.src='https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop'"><div class="impact-label ${isPos ? 'impact-pos' : 'impact-neg'}">${n.target}: ${isPos ? '▲' : '▼'} ${(n.impact*100).toFixed(1)}%</div></div><div class="news-content"><h3 class="news-title">${n.title}</h3><p class="news-description">${n.description}</p></div></article>`;
        }).join('');
        document.getElementById('news-feed').innerHTML = newsHtml;
        this.renderTabs();
    }

    renderTabs() {
        const container = document.getElementById('tab-content');
        const s = this.game.state;
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        document.querySelector(`[data-tab="${this.currentTab}"]`)?.classList.add('active');

        if (this.currentTab === 'market') {
            container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">` + this.game.market.assets.map(a => {
                const y = this.game.market.calculateYield(a.id);
                const impact = this.game.market.activeImpacts[a.sector] || 0;
                const varPct = (y - a.baseYield) * 100;
                const curDiv = a.baseDividend ? Math.round(a.baseDividend * (1 + impact) * 100) / 100 : 0;
                return `
                <div class="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                    <div>
                        <span class="text-[9px] ${a.type==='FII'?'badge-fii':(a.type==='Ações'?'badge-stock':'badge-rf')} px-2 py-1 rounded-lg font-black">${a.type}</span>
                        <h4 class="font-black text-xl mt-1">${a.name}</h4>
                        <div class="mt-1 text-[11px] font-bold text-slate-500">${a.sector} • Rend. Atual: ${(y*100).toFixed(2)}% / ${a.periodicity}</div>
                        ${a.baseDividend ? `<p class="text-emerald-400 font-black text-xs mt-1">Dividendo Estimado: ${this.formatMoney(curDiv)}/cota</p>` : ''}
                    </div>
                    <div class="text-right flex items-center gap-6">
                        <div>
                            <p class="font-mono font-bold text-lg">${a.price ? this.formatMoney(a.price) : 'DIRETO'}</p>
                            ${a.price ? `<span class="text-xs font-black ${varPct>=0?'text-emerald-400':'text-red-400'}">${varPct>=0?'▲':'▼'} ${Math.abs(varPct).toFixed(1)}%</span>` : ''}
                        </div>
                        <button onclick="ui.openTradeModal('${a.id}')" class="px-6 py-3 bg-blue-600 rounded-xl text-xs font-black">INVESTIR</button>
                    </div>
                </div>`; }).join('') + `</div>`;
        }

        if (this.currentTab === 'portfolio') {
            container.innerHTML = `
                <div class="portfolio-grid">
                    <div class="chart-box"><h4>Divisão de Patrimônio</h4><canvas id="allocChart"></canvas></div>
                    <div class="chart-box"><h4>Peso dos FIIs</h4><canvas id="fiiChart"></canvas></div>
                    <div class="chart-box"><h4>Peso das Ações</h4><canvas id="stockChart"></canvas></div>
                </div>
                <div class="space-y-4 mt-12 px-2">
                    <h3 class="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Minha Custódia</h3>
                    ${s.portfolio.map(p => {
                        const a = this.game.market.assets.find(x => x.id === p.id);
                        const y = this.game.market.calculateYield(a.id);
                        const isValueBased = ['Tesouro', 'CDB', 'LCI/LCA'].includes(a.type);
                        const val = a.price ? a.price * p.qty : p.avgPrice;
                        return `<div class="flex justify-between p-6 bg-white/5 border border-white/5 rounded-3xl">
                            <div>
                                <p class="font-black text-xl">${a.name}</p>
                                <p class="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                    ${isValueBased ? 'VALOR TOTAL INVESTIDO' : p.qty.toFixed(0) + ' COTAS EM CARTEIRA'} • REND. ATUAL: ${(y*100).toFixed(2)}% / ${a.periodicity || 'mensal'}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="font-mono font-bold text-blue-400 text-xl">${this.formatMoney(val)}</p>
                                <button onclick="ui.handleSell('${p.id}')" class="text-[10px] text-red-500 font-black uppercase underline mt-1">Vender</button>
                            </div>
                        </div>`; }).join('')}
                </div>`;
            this.renderPortfolioCharts();
        }

        if (this.currentTab === 'income') {
            const hist = s.incomeHistory || [];
            const sel = this.selectedHistoryIndex !== null ? hist[this.selectedHistoryIndex] : null;
            const totalAnnualIncome = hist.reduce((acc, curr) => acc + curr.total, 0);

            const stocksPerf = s.portfolio.filter(p => this.game.market.assets.find(x => x.id === p.id).type === 'Ações');
            const rfPerf = s.portfolio.filter(p => ['Tesouro', 'CDB', 'LCI/LCA'].includes(this.game.market.assets.find(x => x.id === p.id).type));

            container.innerHTML = `
                <div class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="chart-box !h-[400px]"><h4>Dividendos (12 Meses)</h4><canvas id="incomeChart"></canvas></div>
                        <div class="flex flex-col gap-6">
                             <div class="bg-blue-600/10 border border-blue-600/20 p-8 rounded-[40px]">
                                <p class="text-xs text-blue-400 uppercase font-black tracking-[0.3em] mb-2">Acumulado em Dividendos (12m)</p>
                                <p class="text-5xl font-black text-white">${this.formatMoney(totalAnnualIncome)}</p>
                            </div>
                            <div class="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px]">
                                <p class="text-xs text-emerald-400 uppercase font-black tracking-[0.3em] mb-2">Projeção Renda Passiva (Próximo Mês)</p>
                                <p class="text-5xl font-black text-emerald-400">${this.formatMoney(this.calculateNextIncome())}</p>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                        <div class="perf-card">
                            <h3 class="text-xs font-black uppercase text-slate-500 mb-6 tracking-widest text-center">Monitor de Ações (Ganho de Capital)</h3>
                            <div class="space-y-4">
                                ${stocksPerf.map(p => {
                                    const a = this.game.market.assets.find(x => x.id === p.id);
                                    const val = a.price * p.qty;
                                    const profit = val - p.principal;
                                    return `<div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span class="font-bold">${a.name}</span>
                                        <span class="${profit>=0?'profit-text':'loss-text'}">${profit>=0?'+':''}${this.formatMoney(profit)}</span>
                                    </div>`;
                                }).join('') || '<p class="text-xs text-slate-600 italic text-center">Sem ações em carteira.</p>'}
                            </div>
                        </div>
                        <div class="perf-card">
                            <h3 class="text-xs font-black uppercase text-slate-500 mb-6 tracking-widest text-center">Monitor de Renda Fixa (Juros Acumulados)</h3>
                            <div class="space-y-4">
                                ${rfPerf.map(p => {
                                    const a = this.game.market.assets.find(x => x.id === p.id);
                                    const profit = p.avgPrice - p.principal;
                                    return `<div class="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                        <span class="font-bold">${a.name}</span>
                                        <span class="profit-text">+ ${this.formatMoney(profit)}</span>
                                    </div>`;
                                }).join('') || '<p class="text-xs text-slate-600 italic text-center">Sem investimentos de renda fixa.</p>'}
                            </div>
                        </div>
                    </div>

                    ${sel ? `<div class="p-8 bg-blue-600/10 rounded-3xl border border-blue-600/20">
                        <h3 class="font-black uppercase mb-4 text-blue-400 text-sm tracking-widest text-center">Extrato Mês ${sel.month}</h3>
                        ${sel.details.map(d => `<div class="flex justify-between p-3 border-b border-white/5 text-sm"><span>${d.name} (${d.qty} cotas)</span><span class="text-emerald-400 font-mono font-bold">+ ${this.formatMoney(d.amount)}</span></div>`).join('')}
                    </div>` : '<p class="text-center text-slate-500 font-bold italic py-10">Clique em uma barra do gráfico para ver o detalhamento mensal por ativo.</p>'}
                </div>`;
            this.renderIncomeChart();
        }

        if (this.currentTab === 'career') {
            container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + GAME_DATA.JOBS.map(j => {
                const canEdu = s.degrees.includes(j.req);
                const canExp = s.experience >= j.exp;
                return `<div class="p-8 rounded-[40px] border ${s.jobId === j.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5'}">
                    <h4 class="font-black text-2xl mb-2">${j.name}</h4>
                    <p class="text-emerald-400 font-black text-xl mb-6">${this.formatMoney(j.salary)}/mês</p>
                    <div class="space-y-2 text-[10px] uppercase font-black mb-6">
                        <p class="${canEdu?'text-emerald-500':'text-red-400'} tracking-widest">● REQUISITO: ${j.req}</p>
                        <p class="${canExp?'text-emerald-500':'text-red-400'} tracking-widest">● EXPERIÊNCIA: ${j.exp} MESES</p>
                    </div>
                    <button onclick="ui.handleJob('${j.id}')" ${s.jobId===j.id?'disabled':''} class="w-full py-4 rounded-2xl text-[10px] font-black ${canEdu&&canExp?'bg-blue-600':'bg-slate-900 text-slate-700'}">${s.jobId===j.id?'CARGO ATUAL':'CANDIDATAR-SE'}</button>
                </div>`; }).join('') + `</div>`;
        }

        if (this.currentTab === 'edu') {
            container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + GAME_DATA.EDUCATION.map(e => {
                const fin = s.degrees.includes(e.type);
                const cur = s.currentEducation?.id === e.id;
                const can = s.degrees.includes(e.req);
                return `<div class="p-8 rounded-[40px] border ${cur ? 'border-amber-500 bg-amber-500/5' : 'border-white/5'}">
                    <h4 class="font-black text-2xl mb-1">${e.name}</h4>
                    <p class="text-white font-black mb-6">Mensalidade: ${e.cost > 0 ? this.formatMoney(e.cost) : 'Grátis'}</p>
                    <p class="text-[10px] uppercase font-black mb-6 ${can?'text-emerald-500':'text-red-400'} tracking-widest">● PRÉ-REQUISITO: ${e.req}</p>
                    <button onclick="ui.handleEdu('${e.id}')" ${fin||cur?'disabled':''} class="w-full py-4 rounded-2xl text-[10px] font-black ${can?'bg-blue-600':'bg-slate-900 text-slate-700'}">${fin?'CONCLUÍDO':(cur?'CURSANDO':'MATRICULAR')}</button>
                </div>`; }).join('') + `</div>`;
        }

        if (this.currentTab === 'bills') {
            container.innerHTML = `<div class="space-y-4">` + s.pendingBills.map((b, i) => `
                <div class="card-bill p-8 rounded-3xl flex justify-between items-center">
                    <div><p class="font-black text-xl">${b.name}</p><p class="text-xs text-red-500 font-black uppercase tracking-tighter">Mora Acumulada: ${b.interest}%</p></div>
                    <div class="flex items-center gap-8"><p class="font-mono font-bold text-2xl">${this.formatMoney(b.amount)}</p>
                    <button onclick="ui.handlePayBill(${i})" class="px-8 py-4 bg-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest">PAGAR</button></div>
                </div>`).join('') + `</div>`;
        }

        if (this.currentTab === 'assets') {
            const hHtml = GAME_DATA.PROPERTIES.map(h => `<div class="asset-card">
                <div class="asset-img"><img src="${h.local}" onerror="this.parentElement.innerHTML='🏠'"></div>
                <h4 class="font-black text-lg text-center">${h.name}</h4>
                <p class="text-emerald-400 font-black mb-4 text-center">${this.formatMoney(h.price)}</p>
                <button onclick="ui.handlePhysicalBuy('house', '${h.id}')" ${s.ownedAssets.house===h.id?'disabled':''} class="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase">${s.ownedAssets.house===h.id?'ATUAL':'COMPRAR'}</button>
            </div>`).join('');
            const vHtml = GAME_DATA.VEHICLES.map(v => `<div class="asset-card">
                <div class="asset-img"><img src="${v.local}" onerror="this.parentElement.innerHTML='🚗'"></div>
                <h4 class="font-black text-lg text-center">${v.name}</h4>
                <p class="text-emerald-400 font-black mb-4 text-center">${this.formatMoney(v.price)}</p>
                <button onclick="ui.handlePhysicalBuy('vehicle', '${v.id}')" ${s.ownedAssets.vehicle===v.id?'disabled':''} class="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black uppercase">${s.ownedAssets.vehicle===v.id?'ATUAL':'COMPRAR'}</button>
            </div>`).join('');
            container.innerHTML = `<h3 class="text-sm font-black text-slate-500 uppercase mb-6 tracking-widest px-2">Imóveis</h3><div class="assets-grid mb-12">${hHtml}</div><h3 class="text-sm font-black text-slate-500 uppercase mb-6 tracking-widest px-2">Veículos</h3><div class="assets-grid">${vHtml}</div>`;
        }
    }

    renderIncomeChart() {
        const ctx = document.getElementById('incomeChart')?.getContext('2d');
        if (!ctx) return;
        const h = this.game.state.incomeHistory || [];
        const l = h.map(x => `Mês ${x.month}`);
        const d = h.map(x => x.total);
        if (this.incomeChart) this.incomeChart.destroy();
        this.incomeChart = new Chart(ctx, {
            type: 'bar', data: { labels: l, datasets: [{ label: 'Dividendos (R$)', data: d, backgroundColor: h.map((_, i) => i === this.selectedHistoryIndex ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'), borderRadius: 12 }] },
            options: { responsive: true, maintainAspectRatio: false, onClick: (e, elements) => { if (elements.length > 0) { this.selectedHistoryIndex = elements[0].index; this.render(); } }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `R$ ${c.parsed.y.toFixed(2)}` } } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }
        });
    }

    renderPortfolioCharts() {
        this.portfolioCharts.forEach(c => c.destroy());
        this.portfolioCharts = [];
        const s = this.game.state;
        const typeData = { FII: 0, Stock: 0, RF: 0 };
        const fiiData = {}; const stockData = {};
        s.portfolio.forEach(p => {
            const a = this.game.market.assets.find(x => x.id === p.id);
            const v = a.price ? a.price * p.qty : p.avgPrice;
            if (a.type==='FII') { typeData.FII += v; fiiData[assetIdToName(p.id)] = (fiiData[assetIdToName(p.id)] || 0) + v; }
            else if (a.type==='Ações') { typeData.Stock += v; stockData[assetIdToName(p.id)] = (stockData[assetIdToName(p.id)] || 0) + v; }
            else typeData.RF += v;
        });

        function assetIdToName(id) { return GAME_DATA.MARKET.find(m => m.id === id).name; }
        const make = (id, labels, values, colors) => {
            const canv = document.getElementById(id); if (!canv) return;
            const ch = new Chart(canv, { type: 'doughnut', data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 15 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: true, position: 'bottom', labels: { color: '#fff', padding: 15, font: { size: 11, weight: 'bold' }, usePointStyle: true } } } } });
            this.portfolioCharts.push(ch);
        };
        const classColors = ['#FF0055', '#00DDEE', '#00E676'];
        const fiiColors = ['#9D50FF', '#FF4DB2', '#00E676', '#FF9100', '#2979FF'];
        const stockColors = ['#00E5FF', '#F50057', '#651FFF', '#FFEA00', '#1DE9B6'];
        make('allocChart', ['FIIs', 'Ações', 'Renda Fixa'], [typeData.FII, typeData.Stock, typeData.RF], classColors);
        if (Object.keys(fiiData).length) make('fiiChart', Object.keys(fiiData), Object.values(fiiData), fiiColors);
        if (Object.keys(stockData).length) make('stockChart', Object.keys(stockData), Object.values(stockData), stockColors);
    }

    handleJob(id) { if (this.game.state.degrees.includes(GAME_DATA.JOBS.find(j=>j.id===id).req)) { this.game.state.jobId = id; this.render(); } }
    handleEdu(id) { const e = GAME_DATA.EDUCATION.find(x=>x.id===id); if (this.game.state.degrees.includes(e.req) && !this.game.state.currentEducation) { this.game.state.currentEducation = { id, progress: 0 }; this.render(); } }
    
    calculateNextIncome() {
        const s = this.game.state;
        const nextMonth = s.month + 1;
        let total = 0;
        s.portfolio.forEach(p => {
            const asset = this.game.market.assets.find(a => a.id === p.id);
            if (asset.type === 'FII' || asset.type === 'Ações') {
                let willPay = false;
                if (!asset.periodicity || asset.periodicity === 'mensal') willPay = true;
                else if (asset.periodicity === 'semestral' && nextMonth % 6 === 0) willPay = true;
                else if (asset.periodicity === 'anual' && nextMonth % 12 === 0) willPay = true;
                if (willPay) {
                    const impact = this.game.market.activeImpacts[asset.sector] || 0;
                    total += (asset.baseDividend * (1 + impact)) * p.qty;
                }
            }
        });
        return total;
    }

    handlePhysicalBuy(t, id) { if (this.game.buyPhysicalAsset(t, id)) { this.showModal("Sucesso!", "Compra efetuada."); this.render(); } else { this.showModal("Erro", "Saldo insuficiente."); } }
    handlePayBill(i) { if (this.game.payBill(i)) { this.render(); } else { this.showModal("Aviso", "Saldo insuficiente."); } }
    handleSell(id) { 
        const a = this.game.market.assets.find(x => x.id === id);
        const label = ['Tesouro', 'CDB', 'LCI/LCA'].includes(a.type) ? 'Valor em R$:' : 'Quantidade de Cotas:';
        const q = prompt(label); 
        if (q && this.game.sellAsset(id, parseFloat(q))) this.render(); 
    }
}