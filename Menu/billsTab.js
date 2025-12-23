/**
 * Aba de Contas
 */
class BillsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        if (!state.pendingBills || state.pendingBills.length === 0) {
            container.innerHTML = `<div class="p-20 text-center opacity-30 font-black uppercase tracking-[0.2em]">Nenhuma conta pendente</div>`;
            return;
        }

        container.innerHTML = `<div class="space-y-4">` + state.pendingBills.map((b, i) => {
            const isPaid = b.status === 'paid';
            return `
            <div class="card-bill p-8 rounded-3xl flex justify-between items-center ${isPaid ? 'opacity-50 !border-emerald-500/50' : ''}">
                <div>
                    <p class="font-black text-xl text-white">${b.name}</p>
                    ${isPaid 
                        ? `<span class="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md">✓ Paga Automaticamente</span>`
                        : `<p class="text-xs text-red-500 font-black uppercase">Juros: ${b.interest}%</p>`
                    }
                </div>
                <div class="flex items-center gap-8">
                    <p class="font-mono font-bold text-2xl ${isPaid ? 'text-emerald-400' : 'text-white'}">${this.ui.formatMoney(b.amount)}</p>
                    <button onclick="ui.tabs.bills.pay(${i})" 
                            ${isPaid ? 'disabled' : ''}
                            class="px-8 py-4 ${isPaid ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 text-white'} rounded-2xl text-[10px] font-black uppercase transition-all">
                        ${isPaid ? 'PAGA' : 'PAGAR'}
                    </button>
                </div>
            </div>`;
        }).join('') + `</div>`;
    }

    pay(i) { 
        if (this.ui.game.payBill(i)) {
            this.ui.render(); 
        } else {
            this.ui.showModal("Aviso", "Saldo insuficiente na conta para pagar esta fatura."); 
        }
    }
}