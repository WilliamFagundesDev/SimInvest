/**
 * Aba de Upgrades
 * Responsabilidade: Gerir a compra de automações (Auto-Pay e Auto-Reinvest).
 * Corrigido: Validação de estado e feedback de ativação.
 */
class UpgradesTab {
    constructor(ui) {
        this.ui = ui;
    }

    render(container, state) {
        const upgrades = GAME_DATA.UPGRADES;
        // Garanto que o array de upgrades existe para evitar erros de renderização
        const ownedUpgrades = state.upgrades || [];

        container.innerHTML = `
            <div class="space-y-8 animate-in fade-in duration-700">
                <header class="border-b border-white/5 pb-6 mb-6">
                    <h2 class="text-3xl font-black text-white tracking-tighter">Tecnologia & Automação</h2>
                    <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Otimize a sua gestão financeira com assistentes inteligentes</p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    ${upgrades.map(u => {
                        const isOwned = ownedUpgrades.includes(u.id);
                        const canAfford = state.balance >= u.cost;

                        return `
                        <div class="group relative p-10 rounded-[48px] border ${isOwned ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/[0.02]'} transition-all duration-500 hover:border-white/20">
                            <!-- Ícone e Status -->
                            <div class="flex justify-between items-start mb-8">
                                <div class="w-16 h-16 ${isOwned ? 'bg-blue-600' : 'bg-white/5'} rounded-3xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110">
                                    ${u.id === 'auto_pay' ? '🤖' : '🔄'}
                                </div>
                                ${isOwned ? 
                                    `<span class="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20 uppercase tracking-widest">Ativo</span>` : 
                                    `<span class="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest">Disponível</span>`
                                }
                            </div>

                            <!-- Info -->
                            <h3 class="text-2xl font-black text-white mb-2">${u.name}</h3>
                            <p class="text-slate-500 text-xs font-bold leading-relaxed mb-8 uppercase tracking-tight">
                                ${u.description}
                            </p>

                            <!-- Preço e Botão -->
                            <div class="flex items-center justify-between pt-6 border-t border-white/5">
                                <div>
                                    <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Custo de Implementação</p>
                                    <p class="text-xl font-mono font-bold text-white">${isOwned ? 'ADQUIRIDO' : this.ui.formatMoney(u.cost)}</p>
                                </div>
                                
                                <button onclick="ui.tabs.upgrades.buy('${u.id}')" 
                                    ${isOwned || !canAfford ? 'disabled' : ''}
                                    class="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                                    ${isOwned 
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                        : canAfford 
                                            ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(59,130,246,0.3)] hover:scale-105 active:scale-95' 
                                            : 'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'}">
                                    ${isOwned ? 'INSTALADO' : canAfford ? 'COMPRAR AGORA' : 'SALDO INSUFICIENTE'}
                                </button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
    }

    /**
     * Executa a compra do upgrade chamando o motor do jogo.
     */
    buy(id) {
        // Validação extra: verifico se o jogador já tem o upgrade antes de tentar comprar
        if (this.ui.game.state.upgrades.includes(id)) {
            this.ui.showModal("Aviso", "Este upgrade já está ativo no seu sistema.");
            return;
        }

        const success = this.ui.game.buyUpgrade(id);

        if (success) {
            this.ui.render();
            
            const upgrade = GAME_DATA.UPGRADES.find(u => u.id === id);
            this.ui.showModal(
                "Upgrade Ativado!", 
                `O sistema ${upgrade.name} foi instalado com sucesso. A partir do próximo mês, ele funcionará automaticamente.`
            );
        } else {
            this.ui.showModal("Saldo Insuficiente", "Você não tem capital suficiente para implementar esta tecnologia.");
        }
    }
}