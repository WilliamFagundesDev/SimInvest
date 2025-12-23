/**
 * Aba de Upgrades
 */
class UpgradesTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + GAME_DATA.UPGRADES.map(u => {
            const bought = state.upgrades.includes(u.id);
            return `<div class="p-8 rounded-[40px] border border-white/5 flex flex-col justify-between">
                <div><h4 class="font-black text-2xl mb-2">${u.name}</h4><p class="text-slate-400 text-sm mb-4">${u.description}</p>
                <p class="text-emerald-400 font-black text-xl mb-6">${this.ui.formatMoney(u.cost)}</p></div>
                <button onclick="ui.tabs.upgrades.buy('${u.id}')" class="w-full py-4 rounded-2xl text-[10px] font-black ${bought?'bg-emerald-500/20 text-emerald-500 pointer-events-none':'bg-blue-600'}">${bought?'COMPRADO ✓':'COMPRAR UPGRADE'}</button>
            </div>`;
        }).join('') + `</div>`;
    }

    buy(id) { if (this.ui.game.buyUpgrade(id)) this.ui.render(); else this.ui.showModal("Erro", "Saldo insuficiente."); }
}