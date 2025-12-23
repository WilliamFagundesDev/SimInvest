/**
 * Aba de Carreira
 */
class CareerTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + GAME_DATA.JOBS.map(j => {
            const canEdu = state.degrees.includes(j.req);
            const canExp = state.experience >= j.exp;
            const isCur = state.jobId === j.id;
            return `<div class="p-8 rounded-[40px] border ${isCur ? 'border-blue-500 bg-blue-500/5' : 'border-white/5'}">
                <h4 class="font-black text-2xl mb-2">${j.name}</h4>
                <p class="text-emerald-400 font-black text-xl mb-6">${this.ui.formatMoney(j.salary)}/mês</p>
                <div class="space-y-2 text-[10px] uppercase font-black mb-6">
                    <p class="${canEdu?'text-emerald-500':'text-red-400'}">● REQUISITO: ${j.req}</p>
                    <p class="${canExp?'text-emerald-500':'text-red-400'}">● EXP: ${j.exp} MESES</p>
                </div>
                <button onclick="ui.tabs.career.apply('${j.id}')" ${isCur?'disabled':''} class="w-full py-4 rounded-2xl font-black text-[10px] ${canEdu&&canExp?'bg-blue-600':'bg-slate-900 text-slate-700'}">${isCur?'ATUAL':'CANDIDATAR-SE'}</button>
            </div>`;
        }).join('') + `</div>`;
    }

    apply(id) {
        const res = this.ui.game.applyForJob(id);
        if (res.success) this.ui.render(); else this.ui.showModal("Recusado", res.reason);
    }
}