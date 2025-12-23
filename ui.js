/**
 * UI.JS (Refatorado)
 * Responsabilidade: Orquestrar a interface e gerenciar estados globais da UI.
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTab = 'market';
        
        // Inicializa as instâncias das abas
        this.tabs = {
            market: new MarketTab(this),
            portfolio: new PortfolioTab(this),
            income: new IncomeTab(this),
            career: new CareerTab(this),
            edu: new EducationTab(this),
            bills: new BillsTab(this),
            assets: new AssetsTab(this),
            upgrades: new UpgradesTab(this)
        };

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
            
            .sidebar-btn {
                width: 100%; padding: 1rem 1.5rem; text-align: left; border-radius: 16px;
                font-weight: 700; font-size: 14px; color: #94a3b8;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: flex; align-items: center; gap: 12px; border: 1px solid transparent;
            }
            .sidebar-btn:hover:not(.locked) { background: rgba(255, 255, 255, 0.03); color: white; transform: translateX(4px); }
            .sidebar-btn.active { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
            .sidebar-btn.locked { opacity: 0.3; cursor: help; filter: grayscale(1); }
            .sidebar-btn.locked::after { content: 'BLOQUEADO'; font-size: 8px; background: rgba(239, 68, 68, 0.2); color: #f87171; padding: 2px 6px; border-radius: 4px; margin-left: auto; }

            /* Jornal Clássico Restaurado */
            .news-article { background: rgba(255, 255, 255, 0.04); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; margin-bottom: 2rem; box-shadow: 0 10px 25px rgba(0,0,0,0.4); animation: slideIn 0.4s ease forwards; }
            .news-image { width: 100%; height: 180px; position: relative; }
            .news-image img { width: 100%; height: 100%; object-fit: cover; }
            .impact-label { position: absolute; top: 15px; right: 15px; padding: 8px 16px; border-radius: 14px; font-size: 12px; font-weight: 900; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2); z-index: 10; }
            .impact-pos { background: rgba(16, 185, 129, 0.9); color: white; }
            .impact-neg { background: rgba(239, 68, 68, 0.9); color: white; }
            .news-content { padding: 1.5rem; }
            .news-date { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; font-weight: 800; color: #64748b; display: block; margin-bottom: 0.5rem; }
            .news-title { font-size: 1.3rem; font-weight: 900; color: white; margin-bottom: 0.75rem; line-height: 1.2; }
            .news-description { font-size: 0.95rem; color: #94a3b8; line-height: 1.6; }
            .earnings-report { background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.3); }

            /* Portfólio Grid Lado a Lado */
            .portfolio-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; margin-bottom: 2.5rem; }
            .chart-box { background: rgba(255, 255, 255, 0.02); border-radius: 24px; padding: 1.5rem; border: 1px solid rgba(255,255,255,0.05); position: relative; height: 320px; width: 100%; overflow: hidden; display: flex; flex-direction: column; }
            .chart-box h4 { font-size: 10px; font-weight: 900; text-align: center; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 1px; }

            /* Trade Modal Botões */
            .trade-mode-btn { flex: 1; padding: 12px; font-size: 11px; font-weight: 900; border-radius: 14px; background: rgba(255,255,255,0.02); color: #64748b; border: 2px solid transparent; transition: all 0.3s; text-transform: uppercase; }
            .trade-mode-btn.active { background: #3b82f6; color: white; box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4); border: 2px solid rgba(255,255,255,0.2); }

            @media (max-width: 1280px) { .portfolio-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 768px) { 
                #game-nav { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .portfolio-grid { grid-template-columns: 1fr; }
                .chart-box { height: 280px; }
            }
            @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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
                const targetTab = e.currentTarget.getAttribute('data-tab');
                const equity = this.game.calculateEquity();

                if (targetTab === 'edu' && equity < 10000) return this.showModal("Acesso Bloqueado", "A aba Escola requer um patrimônio total de R$ 10.000,00.");
                if (targetTab === 'assets' && equity < 20000) return this.showModal("Acesso Bloqueado", "A aba de Bens Físicos requer um patrimônio de R$ 20.000,00.");
                if (targetTab === 'upgrades' && equity < 100000) return this.showModal("Acesso Bloqueado", "A aba de Upgrades requer um patrimônio de R$ 100.000,00.");

                this.currentTab = targetTab;
                this.render();
            };
        });

        document.getElementById('modal-close').onclick = () => document.getElementById('modal-overlay').classList.add('hidden');
        this.addDevTools();
    }

    handleGameOver() {
        this.showModal("FALÊNCIA TOTAL", "Suas dívidas atingiram 100% de juros. Reiniciando...");
        document.getElementById('modal-close').classList.add('hidden');
        setTimeout(async () => {
            await indexedDB.deleteDatabase('SimInvest_LocalDB');
            location.reload();
        }, 4000);
    }

    addDevTools() {
        const sidebar = document.querySelector('aside');
        if (!sidebar || document.getElementById('dev-reset')) return;
        const btn = document.createElement('button');
        btn.id = 'dev-reset';
        btn.className = 'w-full mt-4 p-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase border border-red-500/20';
        btn.innerHTML = '🔄 Reiniciar Tudo';
        btn.onclick = async () => { if (confirm("Apagar progresso?")) { await indexedDB.deleteDatabase('SimInvest_LocalDB'); location.reload(); }};
        sidebar.appendChild(btn);
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
        
        document.getElementById('nav-edu').classList.toggle('locked', equity < 10000);
        document.getElementById('nav-assets').classList.toggle('locked', equity < 20000);
        document.getElementById('nav-upgrades').classList.toggle('locked', equity < 100000);

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
        
        this.renderNews();

        // Delega a renderização para a aba ativa
        document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === this.currentTab));
        const container = document.getElementById('tab-content');
        if (this.tabs[this.currentTab]) {
            this.tabs[this.currentTab].render(container, s);
        }
    }

    renderNews() {
        const s = this.game.state;
        let html = '';
        const lastIncome = s.incomeHistory[s.incomeHistory.length - 1];
        if (lastIncome && lastIncome.details?.length > 0) {
            const details = lastIncome.details.map(d => `<li><strong>${d.name}</strong>: <strong>${this.formatMoney(d.amount/d.qty)}</strong> p/ cota.</li>`).join('');
            html += `<article class="news-article earnings-report"><div class="news-content"><span class="news-date">Mensal</span><h3 class="news-title">Proventos</h3><ul class="text-xs text-slate-300 mt-4 space-y-2 list-disc pl-5">${details}</ul></div></article>`;
        }
        html += s.newsHistory.slice(0, 10).map(n => `
            <article class="news-article">
                <div class="news-image"><img src="${n.local}" onerror="this.src='https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=800&auto=format&fit=crop'">
                <div class="impact-label ${n.type==='pos'?'impact-pos':'impact-neg'}">${n.target}: ${n.type==='pos'?'▲':'▼'} ${(n.impact*100).toFixed(1)}%</div></div>
                <div class="news-content"><span class="news-date">Mercado</span><h3 class="news-title">${n.title}</h3><p class="news-description">${n.description}</p></div>
            </article>`).join('');
        document.getElementById('news-feed').innerHTML = html;
    }
}