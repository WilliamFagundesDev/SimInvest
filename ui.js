/**
 * UI.JS
 * Responsabilidade: Orquestrar a interface e gerenciar o comportamento do scroll lateral e notícias.
 * Atualizado: Imagens do jornal maiores e inclusão do Resumo de Renda Total no feed.
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'market';
        
        this.tabs = {
            market: new MarketTab(this),
            portfolio: new PortfolioTab(this),
            income: new IncomeTab(this),
            career: new CareerTab(this),
            edu: new EducationTab(this),
            bills: new BillsTab(this),
            assets: new AssetsTab(this),
            rentals: new RentalsTab(this),
            upgrades: new UpgradesTab(this)
        };

        this.initEventListeners();
        this.injectCustomStyles();
        this.addDevTools(); 
    }

    injectCustomStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            /* Fix para travar o crescimento das abas mantendo o layout estável */
            #tab-content { 
                max-height: calc(100vh - 280px) !important; 
                overflow-y: auto !important; 
                overflow-x: hidden;
                padding-right: 8px;
            }

            .chart-box { 
                height: 320px !important; 
                position: relative; 
                width: 100%;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 24px;
                padding: 3rem;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .modal-trade-active { display: flex !important; }
            .badge-fii { background: #8b5cf6; color: white; }
            .badge-stock { background: #3b82f6; color: white; }
            .badge-rf { background: #10b981; color: white; }
            
            .sidebar-btn {
                width: 100%; padding: 1rem 1.5rem; text-align: left; border-radius: 16px;
                font-weight: 700; font-size: 14px; color: #94a3b8;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; align-items: center; gap: 12px; border: 1px solid transparent;
            }
            .sidebar-btn:hover:not(.locked) { background: rgba(255, 255, 255, 0.03); color: white; transform: translateX(4px); }
            .sidebar-btn.active { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
            .sidebar-btn.locked { opacity: 0.3; cursor: help; filter: grayscale(1); }
            
            /* Jornal do Mercado Estilo Compacto com Imagens Maiores */
            .news-article { 
                background: rgba(255, 255, 255, 0.03); 
                border-radius: 24px; 
                border: 1px solid rgba(255, 255, 255, 0.06); 
                overflow: hidden; 
                margin-bottom: 0.85rem; 
                display: flex;
                gap: 1.25rem;
                padding: 1rem;
                animation: slideIn 0.4s ease-out forwards;
                transition: all 0.3s ease;
            }
            .news-article:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); }

            .news-image { width: 95px; height: 95px; flex-shrink: 0; position: relative; border-radius: 16px; overflow: hidden; background: #000; }
            .news-image img { width: 100%; height: 100%; object-fit: cover; }
            
            .impact-label { 
                position: absolute; bottom: 0; left: 0; right: 0; 
                padding: 3px 0; text-align: center; font-size: 9px; font-weight: 900; 
                backdrop-filter: blur(8px); color: white;
            }
            .impact-pos { background: rgba(16, 185, 129, 0.85); color: #bbf7d0; }
            .impact-neg { background: rgba(239, 68, 68, 0.85); color: #fecaca; }

            .news-content { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
            .news-title { font-size: 0.9rem; font-weight: 800; color: white; margin-bottom: 4px; line-height: 1.2; }
            .news-description { font-size: 0.75rem; color: #94a3b8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

            #tab-content::-webkit-scrollbar { width: 4px; }
            #tab-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }

            @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        `;
        document.head.appendChild(style);
    }

    addDevTools() {
        const nav = document.getElementById('game-nav');
        if (!nav || document.getElementById('dev-reset')) return;
        const btn = document.createElement('button');
        btn.id = 'dev-reset';
        btn.className = 'w-full mt-auto p-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all';
        btn.innerHTML = '🔄 Reiniciar Progresso';
        btn.onclick = async () => { if (confirm("Deseja apagar todo o seu progresso?")) { await indexedDB.deleteDatabase('SimInvest_LocalDB'); location.reload(); }};
        nav.appendChild(btn);
    }

    initEventListeners() {
        document.getElementById('btn-next-month').onclick = () => {
            const res = this.game.nextMonth();
            if (res === "GAME_OVER") return this.handleGameOver();
            this.render();
        };

        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.onclick = (e) => {
                const targetTab = e.currentTarget.getAttribute('data-tab');
                const equity = this.game.calculateEquity();

                if (targetTab === 'edu' && equity < 10000) {
                    return this.showModal("Acesso Bloqueado", "A aba Escola requer um patrimônio total de R$ 10.000,00.");
                }
                if (targetTab === 'upgrades' && equity < 50000) {
                    return this.showModal("Acesso Bloqueado", "A aba de Upgrades requer um patrimônio de R$ 50.000,00.");
                }
                if (targetTab === 'rentals' && equity < 100000) {
                    return this.showModal("Acesso Bloqueado", "A aba de Aluguéis requer um patrimônio de R$ 100.000,00.");
                }

                this.currentTab = targetTab;
                this.render();
            };
        });
        document.getElementById('modal-close').onclick = () => document.getElementById('modal-overlay').classList.add('hidden');
    }

    handleGameOver() {
        this.showModal("FALÊNCIA", "Suas dívidas fugiram do controle. Reiniciando...");
        setTimeout(async () => { await indexedDB.deleteDatabase('SimInvest_LocalDB'); location.reload(); }, 3000);
    }

    showModal(title, body) {
        document.getElementById('modal-title').innerText = title;
        document.getElementById('modal-body').innerText = body;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    formatMoney(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

    render() {
        const s = this.game.state;
        const equity = this.game.calculateEquity();
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        document.getElementById('display-date').innerText = `${months[(s.month-1)%12]} • Ano ${Math.floor((s.month-1)/12)+1}`;
        document.getElementById('display-balance').innerText = this.formatMoney(s.balance);
        document.getElementById('display-equity').innerText = this.formatMoney(equity);
        
        const job = GAME_DATA.JOBS.find(j => j.id === s.jobId);
        document.getElementById('display-job').innerText = job ? job.name : "Desempregado";
        document.getElementById('display-edu').innerText = s.degrees[s.degrees.length-1];
        
        if (s.currentEducation) {
            const ed = GAME_DATA.EDUCATION.find(e => e.id === s.currentEducation.id);
            if (ed) {
                const perc = (s.currentEducation.progress / ed.duration) * 100;
                document.getElementById('edu-progress-wrapper').classList.remove('hidden');
                document.getElementById('edu-perc').innerText = `${Math.round(perc)}%`;
                document.getElementById('edu-bar').style.width = `${perc}%`;
            }
        } else {
            document.getElementById('edu-progress-wrapper').classList.add('hidden');
        }

        document.getElementById('nav-edu')?.classList.toggle('locked', equity < 10000);
        document.getElementById('nav-upgrades')?.classList.toggle('locked', equity < 50000);
        document.getElementById('nav-rentals')?.classList.toggle('locked', equity < 100000);
        
        this.renderNews();
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === this.currentTab));
        const container = document.getElementById('tab-content');
        if (this.tabs[this.currentTab]) this.tabs[this.currentTab].render(container, s);
    }

    renderNews() {
        const s = this.game.state;
        const newsHistory = s.newsHistory || [];
        const currentMonthNews = newsHistory.filter(n => n.month === s.month - 1);
        
        let html = `<div class="mb-4 px-1 flex justify-between items-center">
            <span class="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Edição do Dia</span>
            <span class="text-[9px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">${currentMonthNews.length} Fatos</span>
        </div>`;

        // NOVO: Adiciona Resumo de Renda no topo do Jornal se houver histórico do mês anterior
        const lastIncome = s.incomeHistory[s.incomeHistory.length - 1];
        if (lastIncome && lastIncome.month === s.month - 1) {
            html += `
            <article class="news-article bg-emerald-500/5 border-emerald-500/20">
                <div class="news-image bg-emerald-500/20 flex items-center justify-center text-3xl">💰</div>
                <div class="news-content">
                    <span class="text-[8px] text-emerald-400 font-black uppercase tracking-tighter mb-1">Resumo Financeiro</span>
                    <h3 class="news-title">Total Recebido: ${this.formatMoney(lastIncome.total)}</h3>
                    <p class="news-description">A soma de seus salários, dividendos e juros foi creditada com sucesso na sua conta.</p>
                </div>
            </article>`;
        }

        html += currentMonthNews.map(n => {
            const isPos = n.type === 'pos';
            const hasImpact = n.impact && n.impact !== 0;

            return `
            <article class="news-article">
                <div class="news-image">
                    <img src="${n.local}" onerror="this.src='https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop'">
                    ${hasImpact ? `
                    <div class="impact-label ${isPos ? 'impact-pos' : 'impact-neg'}">
                        ${isPos ? '▲' : '▼'} ${(Math.abs(n.impact)*100).toFixed(1)}%
                    </div>` : ''}
                </div>
                <div class="news-content">
                    <span class="text-[8px] text-blue-400 font-black uppercase tracking-tighter mb-1">${n.target || 'MERCADO'}</span>
                    <h3 class="news-title">${n.title}</h3>
                    <p class="news-description">${n.description}</p>
                </div>
            </article>`;
        }).join('');

        if (currentMonthNews.length === 0 && !lastIncome) {
            html += `<div class="py-10 text-center text-slate-600 italic text-[10px]">Aguardando fatos do próximo mês...</div>`;
        }

        document.getElementById('news-feed').innerHTML = html;
    }
}