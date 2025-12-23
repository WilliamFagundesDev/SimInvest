/**
 * Aba de Aluguéis
 * Atualizado: Sincronização garantida com o motor do jogo.
 */
class RentalsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        if (!state.ownedAssets.houses || state.ownedAssets.houses.length === 0) {
            container.innerHTML = `
                <div class="p-20 text-center flex flex-col items-center gap-6 animate-in fade-in duration-700">
                    <div class="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl grayscale opacity-30">🏠</div>
                    <p class="text-slate-500 font-black uppercase tracking-[0.2em] max-w-xs">Você ainda não possui imóveis para colocar para alugar.</p>
                    <button onclick="ui.currentTab = 'assets'; ui.render();" class="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all">Ir para a Loja</button>
                </div>`;
            return;
        }

        const listHtml = state.ownedAssets.houses.map((house, index) => {
            const data = GAME_DATA.PROPERTIES.find(p => p.id === house.id);
            const rentValue = data.price * 0.005;
            
            return `
            <div class="bg-slate-900/40 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 group">
                <div class="w-32 h-32 flex-shrink-0 bg-black/20 rounded-2xl p-4 overflow-hidden">
                    <img src="${data.local}" class="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/100x100?text=Casa'">
                </div>
                
                <div class="flex-1 text-center md:text-left">
                    <h4 class="text-xl font-black text-white mb-1">${data.name}</h4>
                    <div class="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div class="bg-white/5 px-4 py-2 rounded-xl">
                            <span class="text-[8px] text-slate-500 font-black uppercase block">Rendimento Aluguel</span>
                            <span class="text-emerald-400 font-mono font-bold">${this.ui.formatMoney(rentValue)}/mês</span>
                        </div>
                        <div class="bg-white/5 px-4 py-2 rounded-xl">
                            <span class="text-[8px] text-slate-500 font-black uppercase block">Economia Manutenção</span>
                            <span class="text-blue-400 font-mono font-bold">${this.ui.formatMoney(data.maintenance)}/mês</span>
                        </div>
                    </div>
                </div>

                <div class="w-full md:w-auto text-right">
                    ${house.vacancyRemaining > 0 
                        ? `<div class="mb-4 text-right">
                             <span class="text-[10px] text-red-500 font-black uppercase animate-pulse tracking-widest block">⚠ Imóvel Vago</span>
                             <span class="text-xs text-slate-400 font-bold">Novo inquilino em ${house.vacancyRemaining} meses</span>
                           </div>`
                        : ''}
                    
                    <button onclick="ui.tabs.rentals.toggle(${index})" 
                        class="w-full md:w-48 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all
                        ${house.isRented ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white text-black hover:bg-emerald-600 hover:text-white'}">
                        ${house.isRented ? 'DESISTIR ALUGUEL' : 'COLOCAR PARA ALUGAR'}
                    </button>
                </div>
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                <header class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div class="flex-1">
                        <h2 class="text-3xl font-black text-white tracking-tighter">Gestão de Aluguéis</h2>
                        <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Rentabilize seu patrimônio imobiliário</p>
                    </div>
                    <div class="flex items-center gap-4">
                        <button onclick="ui.tabs.rentals.rentAll()" class="px-6 py-4 bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 rounded-2xl text-[10px] font-black uppercase hover:bg-emerald-600 hover:text-white transition-all">
                            ALUGAR TODOS
                        </button>
                        <div class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-right">
                            <span class="text-[10px] font-black uppercase block text-emerald-500">Yield Meta</span>
                            <span class="text-2xl font-mono font-bold text-emerald-400">0.50% / mês</span>
                        </div>
                    </div>
                </header>
                <div class="grid grid-cols-1 gap-6 pb-20">${listHtml}</div>
            </div>`;
    }

    toggle(index) {
        if (this.ui.game.toggleRental(index)) this.ui.render();
    }

    rentAll() {
        // Agora o método rentAllHouses existe no motor do jogo
        if (this.ui.game.rentAllHouses()) {
            this.ui.render();
            this.ui.showModal("Gestão Ativada", "Todos os imóveis vagos foram colocados para alugar!");
        } else {
            this.ui.showModal("Aviso", "Todos os seus imóveis já estão sendo alugados.");
        }
    }
}