/**
 * Aba de Bens
 */
class AssetsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        const hHtml = GAME_DATA.PROPERTIES.map(h => `<div class="asset-card p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <div class="h-24 flex items-center justify-center text-4xl mb-4">🏠</div>
            <h4 class="font-black text-lg">${h.name}</h4>
            <p class="text-emerald-400 font-black mb-4">${this.ui.formatMoney(h.price)}</p>
            <button onclick="ui.tabs.assets.buy('house', '${h.id}')" ${state.ownedAssets.house===h.id?'disabled':''} class="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black">${state.ownedAssets.house===h.id?'ATUAL':'COMPRAR'}</button>
        </div>`).join('');
        const vHtml = GAME_DATA.VEHICLES.map(v => `<div class="asset-card p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
            <div class="h-24 flex items-center justify-center text-4xl mb-4">🚗</div>
            <h4 class="font-black text-lg">${v.name}</h4>
            <p class="text-emerald-400 font-black mb-4">${this.ui.formatMoney(v.price)}</p>
            <button onclick="ui.tabs.assets.buy('vehicle', '${v.id}')" ${state.ownedAssets.vehicle===v.id?'disabled':''} class="w-full py-4 bg-slate-800 rounded-2xl text-[10px] font-black">${state.ownedAssets.vehicle===v.id?'ATUAL':'COMPRAR'}</button>
        </div>`).join('');
        container.innerHTML = `<h3 class="text-xs font-black uppercase text-slate-500 mb-6 tracking-widest">Imóveis</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">${hHtml}</div><h3 class="text-xs font-black uppercase text-slate-500 mb-6 tracking-widest">Veículos</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-6">${vHtml}</div>`;
    }

    buy(t, id) { if (this.ui.game.buyPhysicalAsset(t, id)) this.ui.render(); else this.ui.showModal("Erro", "Saldo insuficiente."); }
}