/**
 * Aba de Mercado
 */
class MarketTab {
    constructor(ui) {
        this.ui = ui;
        this.selectedAssetId = null;
        this.tradeMode = 'quantity';
    }

    render(container, state) {
        container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + this.ui.game.market.assets.map(a => {
            const y = this.ui.game.market.calculateYield(a.id);
            const impact = this.ui.game.market.activeImpacts[a.sector] || 0;
            const curDiv = a.baseDividend ? Math.round(a.baseDividend * (1 + impact) * 100) / 100 : 0;
            return `
            <div class="flex items-center justify-between p-6 bg-white/[0.03] rounded-[32px] border border-white/5">
                <div>
                    <span class="text-[8px] ${a.type==='FII'?'badge-fii':(a.type==='Ações'?'badge-stock':'badge-rf')} px-2 py-0.5 rounded font-black uppercase tracking-widest">${a.type}</span>
                    <h4 class="font-black text-lg text-white mt-1">${a.name}</h4>
                    <div class="text-[10px] font-bold text-slate-500 uppercase">Rend: ${(y*100).toFixed(2)}%</div>
                    ${a.baseDividend ? `<p class="text-emerald-400 font-bold text-[11px] mt-1">${this.ui.formatMoney(curDiv)} / cota</p>` : ''}
                </div>
                <div class="text-right flex flex-col items-end gap-2">
                    <p class="font-mono font-bold text-lg text-white">${a.price ? this.ui.formatMoney(a.price) : 'DIRETO'}</p>
                    <button onclick="ui.tabs.market.openTrade('${a.id}')" class="px-6 py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">INVESTIR</button>
                </div>
            </div>`;
        }).join('') + `</div>`;
        this.ensureModal();
    }

    ensureModal() {
        if (document.getElementById('trade-modal')) return;
        const html = `
            <div id="trade-modal" class="hidden fixed inset-0 bg-black/95 backdrop-blur-md z-[600] flex items-center justify-center p-4">
                <div class="card-glass max-w-sm w-full p-10 rounded-[40px] border border-white/10">
                    <h3 id="trade-title" class="text-2xl font-black mb-1">Negociar</h3>
                    <p id="trade-asset-info" class="text-slate-500 text-[10px] mb-6 uppercase font-bold"></p>
                    <div id="trade-mode-container" class="flex gap-2 mb-6 bg-black/20 p-1.5 rounded-[20px] border border-white/5">
                        <button onclick="ui.tabs.market.setMode('quantity')" id="mode-qty" class="trade-mode-btn active">COTAS</button>
                        <button onclick="ui.tabs.market.setMode('value')" id="mode-val" class="trade-mode-btn">VALOR</button>
                    </div>
                    <div class="space-y-6">
                        <input type="number" id="trade-input" class="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-2xl font-mono text-white outline-none" placeholder="0">
                        <div class="bg-blue-500/10 p-5 rounded-3xl border border-blue-500/20 text-center">
                            <p id="trade-res-label" class="text-[10px] text-blue-400 font-black uppercase mb-1">Total</p>
                            <p id="trade-total" class="text-2xl font-mono font-bold">R$ 0,00</p>
                        </div>
                        <div class="flex gap-4">
                            <button onclick="ui.tabs.market.closeTrade()" class="flex-1 py-5 bg-slate-900 rounded-2xl font-black text-[10px]">VOLTAR</button>
                            <button onclick="ui.tabs.market.confirmTrade()" class="flex-1 py-5 bg-blue-600 rounded-2xl font-black text-[10px]">CONFIRMAR</button>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('trade-input').oninput = (e) => this.updateTotal(e.target.value);
    }

    openTrade(id) {
        this.selectedAssetId = id;
        const asset = this.ui.game.market.assets.find(a => a.id === id);
        const isRF = ['Tesouro', 'CDB', 'LCI/LCA'].includes(asset.type);
        document.getElementById('trade-title').innerText = asset.name;
        document.getElementById('trade-asset-info').innerText = `${asset.type} • ${asset.sector}`;
        document.getElementById('trade-mode-container').style.display = isRF ? 'none' : 'flex';
        this.setMode(isRF ? 'value' : 'quantity');
        document.getElementById('trade-modal').classList.add('modal-trade-active');
    }

    setMode(m) {
        this.tradeMode = m;
        document.getElementById('mode-qty').classList.toggle('active', m === 'quantity');
        document.getElementById('mode-val').classList.toggle('active', m === 'value');
        document.getElementById('trade-input').value = "";
        this.updateTotal(0);
    }

    updateTotal(val) {
        const asset = this.ui.game.market.assets.find(a => a.id === this.selectedAssetId);
        const input = parseFloat(val) || 0;
        const display = document.getElementById('trade-total');
        if (this.tradeMode === 'quantity') {
            display.innerText = this.ui.formatMoney(asset.price ? asset.price * input : input);
        } else {
            display.innerText = asset.price ? Math.floor(input / asset.price) + " cotas" : this.ui.formatMoney(input);
        }
    }

    confirmTrade() {
        const val = parseFloat(document.getElementById('trade-input').value);
        const asset = this.ui.game.market.assets.find(a => a.id === this.selectedAssetId);
        let qty = val;
        if (this.tradeMode === 'value' && asset.price) qty = Math.floor(val / asset.price);
        
        if (qty > 0 && this.ui.game.buyAsset(this.selectedAssetId, qty)) {
            this.closeTrade();
            this.ui.render();
        } else this.ui.showModal("Erro", "Saldo insuficiente.");
    }

    closeTrade() { document.getElementById('trade-modal').classList.remove('modal-trade-active'); }
}