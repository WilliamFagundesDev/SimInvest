/**
 * Aba de Educação
 * Restaurado: Duração dos cursos em meses e status de progresso.
 */
class EducationTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
                ${GAME_DATA.EDUCATION.map(e => {
                    const hasDegree = state.degrees.includes(e.type) || state.degrees.includes(e.name);
                    const isCurrent = state.currentEducation && state.currentEducation.id === e.id;
                    const canStart = !state.currentEducation && state.degrees.includes(e.req) && !hasDegree;
                    
                    return `
                    <div class="p-8 rounded-[40px] border ${isCurrent ? 'border-blue-500 bg-blue-500/5' : 'border-white/5'} transition-all hover:bg-white/[0.02] flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-6">
                                <h4 class="font-black text-2xl text-white leading-tight">${e.name}</h4>
                                <span class="text-[9px] font-black uppercase px-2 py-1 bg-white/5 rounded-lg text-slate-500">${e.type}</span>
                            </div>
                            
                            <div class="space-y-4 mb-8">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">💰</div>
                                    <div>
                                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest">Investimento</p>
                                        <p class="font-bold text-white">${e.cost > 0 ? this.ui.formatMoney(e.cost) + '/mês' : 'Gratuito'}</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">⏳</div>
                                    <div>
                                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest">Duração Total</p>
                                        <p class="font-bold text-blue-400">${e.duration} meses</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg">📝</div>
                                    <div>
                                        <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest">Requisito</p>
                                        <p class="font-bold ${state.degrees.includes(e.req) ? 'text-emerald-500' : 'text-red-400'}">${e.req}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        ${isCurrent ? `
                        <div class="mt-4">
                            <div class="flex justify-between text-[10px] font-black uppercase mb-2">
                                <span class="text-blue-400">Progresso</span>
                                <span class="text-blue-400">${state.currentEducation.progress} / ${e.duration} Meses</span>
                            </div>
                            <div class="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                <div class="bg-blue-500 h-full transition-all duration-700" style="width: ${(state.currentEducation.progress/e.duration)*100}%"></div>
                            </div>
                        </div>
                        ` : `
                        <button onclick="ui.tabs.edu.start('${e.id}')" 
                                ${!canStart || hasDegree ? 'disabled' : ''} 
                                class="w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all
                                ${hasDegree ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                                  canStart ? 'bg-white text-black hover:bg-blue-600 hover:text-white' : 
                                  'bg-slate-900 text-slate-700 cursor-not-allowed'}">
                            ${hasDegree ? 'CONCLUÍDO' : canStart ? 'MATRICULAR-SE' : 'BLOQUEADO'}
                        </button>
                        `}
                    </div>`;
                }).join('')}
            </div>`;
    }

    start(id) {
        const edu = GAME_DATA.EDUCATION.find(e => e.id === id);
        if (edu) {
            this.ui.game.state.currentEducation = { id: id, progress: 0 };
            this.ui.render();
        }
    }
}