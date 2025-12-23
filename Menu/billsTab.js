/**
 * Aba de Contas
 * Atualizado: Botão para pagar todas as contas e destaque no valor total.
 */
class BillsTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        const pendingBills = state.pendingBills.filter(b => b.status !== 'paid');
        const totalPending = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

        if (!state.pendingBills || state.pendingBills.length === 0) {
            container.innerHTML = `
                <div class="p-20 text-center flex flex-col items-center gap-6 animate-in fade-in duration-700">
                    <div class="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-3xl">✅</div>
                    <div>
                        <p class="text-white font-black text-xl mb-1 uppercase tracking-tighter">Tudo em dia!</p>
                        <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">Você não possui faturas pendentes este mês.</p>
                    </div>
                </div>`;
            return;
        }

        const billsHtml = state.pendingBills.map((b, i) => {
            const isPaid = b.status === 'paid';
            const isLate = b.interest > 0 && !isPaid;
            
            let icon = "🧾";
            if (b.name.includes("Aluguel")) icon = "🏠";
            if (b.name.includes("Luz") || b.name.includes("Internet")) icon = "⚡";
            if (b.name.includes("Mensalidade")) icon = "🎓";
            if (b.name.includes("Manutenção")) icon = "🔧";
            if (b.name.includes("Alimentação")) icon = "🛒";

            return `
            <div class="group relative bg-slate-900/40 border ${isLate ? 'border-red-500/30' : 'border-white/5'} rounded-[32px] p-8 transition-all duration-300 hover:bg-slate-900/60 hover:border-white/10 ${isPaid ? 'opacity-40 grayscale-[0.5]' : ''}">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div class="flex items-center gap-6">
                        <div class="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">
                            ${icon}
                        </div>
                        <div>
                            <h4 class="text-xl font-black text-white mb-1 leading-tight">${b.name}</h4>
                            <div class="flex items-center gap-3">
                                ${isPaid 
                                    ? `<span class="text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">✓ Liquidado</span>`
                                    : isLate 
                                        ? `<span class="text-[9px] font-black uppercase text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">⚠ Atrasado (+${b.interest}%)</span>`
                                        : `<span class="text-[9px] font-black uppercase text-slate-500 bg-white/5 px-2 py-1 rounded-lg">Aguardando Pagamento</span>`
                                }
                            </div>
                        </div>
                    </div>

                    <div class="flex flex-col md:flex-row items-center gap-8 md:text-right">
                        <div class="flex flex-col items-center md:items-end">
                            <span class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Valor Final</span>
                            <p class="font-mono font-bold text-2xl ${isPaid ? 'text-emerald-400' : (isLate ? 'text-red-400' : 'text-white')}">
                                ${this.ui.formatMoney(b.amount)}
                            </p>
                        </div>
                        <button onclick="ui.tabs.bills.pay(${i})" 
                                ${isPaid ? 'disabled' : ''}
                                class="w-full md:w-40 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all
                                ${isPaid 
                                    ? 'bg-slate-800 text-slate-600 border border-transparent' 
                                    : 'bg-white text-black hover:bg-emerald-500 hover:text-white hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)]'}">
                            ${isPaid ? 'PAGO' : 'PAGAR'}
                        </button>
                    </div>
                </div>
                ${i < state.pendingBills.length - 1 ? `<div class="absolute -bottom-3 left-1/2 -translate-x-1/2 w-11/12 h-px bg-white/5"></div>` : ''}
            </div>`;
        }).join('');

        container.innerHTML = `
            <div class="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                <header class="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-white/5 pb-10 mb-8">
                    <div>
                        <h2 class="text-3xl font-black text-white tracking-tighter">Centro de Custos</h2>
                        <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Gerencie suas despesas fixas e variáveis</p>
                    </div>
                    
                    <div class="flex flex-col md:flex-row items-center gap-6 bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-2xl">
                        <div class="text-center md:text-right px-4">
                            <p class="text-[9px] text-blue-400 font-black uppercase tracking-widest mb-1">Total a Liquidar</p>
                            <p class="text-3xl font-mono font-bold text-white">${this.ui.formatMoney(totalPending)}</p>
                        </div>
                        
                        <button onclick="ui.tabs.bills.payAll()" 
                            ${totalPending === 0 ? 'disabled' : ''}
                            class="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all">
                            PAGAR TUDO
                        </button>
                    </div>
                </header>
                
                <div class="grid grid-cols-1 gap-6 pb-20">
                    ${billsHtml}
                </div>
            </div>`;
    }

    pay(i) { 
        if (this.ui.game.payBill(i)) this.ui.render(); 
        else this.ui.showModal("Saldo Insuficiente", "Seu saldo atual não é suficiente para esta fatura."); 
    }

    payAll() {
        const res = this.ui.game.payAllBills();
        if (res.success) this.ui.render();
        else this.ui.showModal("Atenção", res.reason);
    }
}