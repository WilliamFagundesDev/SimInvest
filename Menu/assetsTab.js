/**
 * Aba de Bens (Atualizada para compra múltipla)
 */
class AssetsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        const renderCard = (item, type) => {
            const canAfford = state.balance >= item.price;
            const count = type === 'house' 
                ? state.ownedAssets.houses.filter(h => h.id === item.id).length 
                : state.ownedAssets.vehicles.filter(v => v === item.id).length;
            
            return `
            <div class="group relative bg-slate-900/60 border border-white/5 rounded-[40px] overflow-hidden transition-all duration-700 hover:border-blue-500/30 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                <div class="absolute top-6 left-6 z-30 flex items-center gap-2">
                    <div class="px-3 py-1 bg-blue-500 text-white text-[9px] font-black rounded-lg shadow-lg shadow-blue-500/40 uppercase">
                        Nível ${item.level || 0}
                    </div>
                    ${count > 0 ? `<div class="px-3 py-1 bg-emerald-500 text-white text-[9px] font-black rounded-lg shadow-lg shadow-emerald-500/40 uppercase">Possui: ${count}</div>` : ''}
                </div>

                <div class="relative h-64 w-full flex items-center justify-center overflow-hidden bg-[#020617]">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(59,130,246,0.15),_transparent_70%)] transition-all duration-700 group-hover:scale-150"></div>
                    <div class="relative z-20 w-full h-full p-8 flex items-center justify-center transform transition-all duration-700 group-hover:translate-y-[-10px] group-hover:scale-105">
                        <img src="${item.local}" class="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]" onerror="this.src='https://placehold.co/400x300/0f172a/64748b?text=Visualizando...'">
                    </div>
                </div>

                <div class="p-8 bg-gradient-to-b from-slate-900/80 to-slate-950">
                    <div class="mb-6">
                        <h4 class="text-2xl font-black text-white tracking-tight">${item.name}</h4>
                        <div class="h-1 w-12 bg-blue-600 rounded-full mt-2 transition-all duration-700 group-hover:w-full"></div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-8">
                        <div class="flex flex-col">
                            <span class="text-[9px] text-slate-500 font-black uppercase mb-1">Preço</span>
                            <span class="text-lg font-mono font-bold text-white">${this.ui.formatMoney(item.price)}</span>
                        </div>
                        <div class="flex flex-col border-l border-white/5 pl-4">
                            <span class="text-[9px] text-slate-500 font-black uppercase mb-1">Manutenção</span>
                            <span class="text-lg font-mono font-bold text-red-500">-${this.ui.formatMoney(item.maintenance)}</span>
                        </div>
                    </div>

                    <button onclick="ui.tabs.assets.buy('${type}', '${item.id}')" 
                        ${!canAfford ? 'disabled' : ''} 
                        class="w-full py-5 rounded-[20px] font-black text-[12px] uppercase tracking-[0.15em] transition-all duration-300
                        ${canAfford ? 'bg-white text-black hover:bg-blue-500 hover:text-white hover:shadow-[0_15px_30px_rgba(59,130,246,0.3)] active:scale-95' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}">
                        ${canAfford ? 'Adquirir Novo' : 'Saldo Insuficiente'}
                    </button>
                </div>
            </div>`;
        };

        const hHtml = GAME_DATA.PROPERTIES.map(h => renderCard(h, 'house')).join('');
        const vHtml = GAME_DATA.VEHICLES.map(v => renderCard(v, 'vehicle')).join('');

        container.innerHTML = `
            <div class="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <section>
                    <div class="flex items-center gap-6 mb-10">
                        <h3 class="text-xs font-black uppercase text-white tracking-[0.4em] whitespace-nowrap">Imóveis & Residências</h3>
                        <div class="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">${hHtml}</div>
                </section>

                <section>
                    <div class="flex items-center gap-6 mb-10">
                        <h3 class="text-xs font-black uppercase text-white tracking-[0.4em] whitespace-nowrap">Frota de Veículos</h3>
                        <div class="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent"></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">${vHtml}</div>
                </section>
            </div>`;
    }

    buy(t, id) { 
        if (this.ui.game.buyPhysicalAsset(t, id)) this.ui.render(); 
        else this.ui.showModal("Erro", "Saldo insuficiente."); 
    }
}