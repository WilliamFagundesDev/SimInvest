/**
 * Aba de Escola
 */
class EducationTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        container.innerHTML = `<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">` + GAME_DATA.EDUCATION.map(e => {
            const fin = state.degrees.includes(e.type);
            const cur = state.currentEducation?.id === e.id;
            const can = state.degrees.includes(e.req);
            return `<div class="p-8 rounded-[40px] border ${cur ? 'border-amber-500 bg-amber-500/5' : 'border-white/5'}">
                <h4 class="font-black text-2xl mb-1">${e.name}</h4>
                <p class="text-white font-black mb-6">Mensalidade: ${e.cost > 0 ? this.ui.formatMoney(e.cost) : 'Grátis'}</p>
                <p class="text-[10px] font-black uppercase ${can?'text-emerald-500':'text-red-400'} mb-6">● PRÉ-REQUISITO: ${e.req}</p>
                <button onclick="ui.tabs.edu.enroll('${e.id}')" ${fin||cur?'disabled':''} class="w-full py-4 rounded-2xl font-black text-[10px] ${can?'bg-blue-600':'bg-slate-900 text-slate-700'}">${fin?'CONCLUÍDO':(cur?'CURSANDO':'MATRICULAR')}</button>
            </div>`;
        }).join('') + `</div>`;
    }

    enroll(id) {
        const e = GAME_DATA.EDUCATION.find(x=>x.id===id);
        if (this.ui.game.state.degrees.includes(e.req) && !this.ui.game.state.currentEducation) {
            this.ui.game.state.currentEducation = { id, progress: 0 };
            this.ui.render();
        }
    }
}