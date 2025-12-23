/**
 * Aba de Carreira
 */
class CareerTab {
    constructor(ui) { this.ui = ui; }

    render(container, state) {
        const bonus = this.ui.game.calculateSalaryBonus();
        
        container.innerHTML = `
            <div class="mb-10 bg-blue-600/10 p-8 rounded-[40px] border border-blue-600/20 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 class="text-xl font-black text-white">Fidelidade no Cargo</h3>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Tempo no emprego atual: ${state.jobId ? state.currentJobExperience : 0} meses</p>
                </div>
                <div class="text-center md:text-right">
                    <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Aumento Acumulado</p>
                    <p class="text-4xl font-black text-white">+ ${(bonus * 100).toFixed(0)}% <span class="text-sm text-slate-500">/ 100%</span></p>
                </div>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">` + GAME_DATA.JOBS.map(j => {
            const hasEdu = state.degrees.includes(j.req);
            const hasSpecificEdu = !j.eduReq || state.degrees.includes(j.eduReq);
            const hasVehicle = !j.vehicleReq || state.ownedAssets.vehicles.includes(j.vehicleReq);
            const hasExp = state.experience >= j.exp;
            
            const isCur = state.jobId === j.id;
            const canApply = hasEdu && hasSpecificEdu && hasVehicle && hasExp;
            
            // Salário Base vs Salário com Bônus (apenas se for o emprego atual)
            const displaySalary = isCur ? j.salary * (1 + bonus) : j.salary;

            let vehicleName = "";
            if (j.vehicleReq) {
                const v = GAME_DATA.VEHICLES.find(x => x.id === j.vehicleReq);
                vehicleName = v.name;
            }

            return `
            <div class="p-8 rounded-[40px] border ${isCur ? 'border-blue-500 bg-blue-500/5' : 'border-white/5'} transition-all hover:bg-white/[0.02]">
                <h4 class="font-black text-2xl mb-2">${j.name}</h4>
                <div class="flex items-baseline gap-2 mb-6">
                    <p class="text-emerald-400 font-black text-xl">${this.ui.formatMoney(displaySalary)}</p>
                    ${isCur && bonus > 0 ? `<p class="text-slate-500 text-[10px] line-through font-bold">${this.ui.formatMoney(j.salary)}</p>` : ''}
                </div>
                
                <div class="space-y-2 text-[10px] uppercase font-black mb-8">
                    <p class="${hasEdu?'text-emerald-500':'text-red-400'}">● ESCOLARIDADE: ${j.req}</p>
                    ${j.eduReq ? `<p class="${hasSpecificEdu?'text-emerald-500':'text-red-400'}">● DIPLOMA: ${j.eduReq}</p>` : ''}
                    ${j.vehicleReq ? `<p class="${hasVehicle?'text-emerald-500':'text-red-400'}">● REQUISITO: ${vehicleName}</p>` : ''}
                    <p class="${hasExp?'text-emerald-500':'text-red-400'}">● EXPERIÊNCIA TOTAL: ${j.exp} MESES</p>
                </div>

                <button onclick="ui.tabs.career.apply('${j.id}')" 
                        ${isCur || !canApply ? 'disabled' : ''} 
                        class="w-full py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all
                        ${isCur ? 'bg-slate-800 text-slate-500 border border-white/5' : 
                          canApply ? 'bg-blue-600 text-white hover:scale-[1.02]' : 
                          'bg-slate-900 text-slate-700 cursor-not-allowed opacity-50'}">
                    ${isCur ? 'CARGO ATUAL' : canApply ? 'MUDAR DE EMPREGO' : 'BLOQUEADO'}
                </button>
                ${!isCur && canApply ? `<p class="text-center text-[8px] text-red-400 font-black uppercase mt-2">⚠ O bônus de fidelidade será resetado!</p>` : ''}
            </div>`;
        }).join('') + `</div>`;
    }

    apply(id) {
        const res = this.ui.game.applyForJob(id);
        if (res.success) this.ui.render(); 
        else this.ui.showModal("Candidatura Recusada", res.reason);
    }
}