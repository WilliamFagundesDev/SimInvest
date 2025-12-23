/**
 * Aba de Contas
 */
class BillsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        container.innerHTML = `<div class="space-y-4">` + state.pendingBills.map((b, i) => `
            <div class="card-bill p-8 rounded-3xl flex justify-between items-center">
                <div><p class="font-black text-xl">${b.name}</p><p class="text-xs text-red-500 font-black uppercase">Mora: ${b.interest}%</p></div>
                <div class="flex items-center gap-8"><p class="font-mono font-bold text-2xl">${this.ui.formatMoney(b.amount)}</p>
                <button onclick="ui.tabs.bills.pay(${i})" class="px-8 py-4 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase">PAGAR</button></div>
            </div>`).join('') + `</div>`;
    }

    pay(i) { if (this.ui.game.payBill(i)) this.ui.render(); else this.ui.showModal("Aviso", "Saldo insuficiente."); }
}