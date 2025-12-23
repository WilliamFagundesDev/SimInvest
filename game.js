/**
 * GAME.JS
 * Responsabilidade: Gerir o estado global, a progressão mensal e todas as regras de negócio.
 * FIX CRÍTICO: Multiplicador de aluguel corrigido para 0,005 (0,5%) na lógica de processamento.
 */

class GameController {
    constructor(storage, market) {
        this.storage = storage;
        this.market = market;
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            month: 1,
            balance: 5000,
            jobId: null,
            experience: 0,        
            currentJobExperience: 0, 
            degrees: ['Fundamental'],
            currentEducation: null,
            portfolio: [],
            ownedAssets: { 
                houses: [], 
                vehicles: [] 
            },
            pendingBills: [], 
            incomeHistory: [], 
            newsHistory: [],
            upgrades: [] 
        };
    }

    async init() {
        const saved = await this.storage.load();
        if (saved) {
            this.state = saved;
            if (this.state.currentJobExperience === undefined) this.state.currentJobExperience = 0;
            if (!this.state.upgrades) this.state.upgrades = [];
            if (!this.state.pendingBills) this.state.pendingBills = [];
            
            if (!Array.isArray(this.state.ownedAssets.houses)) {
                const oldHouse = this.state.ownedAssets.house;
                const oldVehicle = this.state.ownedAssets.vehicle;
                this.state.ownedAssets = {
                    houses: oldHouse ? [{ id: oldHouse, isRented: false, vacancyRemaining: 0 }] : [],
                    vehicles: oldVehicle ? [oldVehicle] : []
                };
            }
        }
    }

    calculateEquity() {
        let equity = this.state.balance;
        this.state.portfolio.forEach(p => {
            const asset = this.market.assets.find(a => a.id === p.id);
            if (asset) equity += asset.price ? asset.price * p.qty : p.avgPrice;
        });
        this.state.ownedAssets.houses.forEach(h => {
            const data = GAME_DATA.PROPERTIES.find(p => p.id === h.id);
            if (data) equity += data.price;
        });
        this.state.ownedAssets.vehicles.forEach(vId => {
            const data = GAME_DATA.VEHICLES.find(v => v.id === vId);
            if (data) equity += data.price;
        });
        return equity;
    }

    calculateSalaryBonus() {
        const yearsInJob = Math.floor(this.state.currentJobExperience / 12);
        return Math.min(1.0, yearsInJob * 0.10); 
    }

    applyForJob(jobId) {
        const job = GAME_DATA.JOBS.find(j => j.id === jobId);
        if (!job) return { success: false, reason: "Emprego não encontrado." };
        const hasEdu = this.state.degrees.includes(job.req);
        const hasSpecificEdu = !job.eduReq || this.state.degrees.includes(job.eduReq);
        const hasVehicle = !job.vehicleReq || this.state.ownedAssets.vehicles.includes(job.vehicleReq);
        const hasExp = this.state.experience >= job.exp;

        if (hasEdu && hasSpecificEdu && hasVehicle && hasExp) {
            this.state.jobId = jobId;
            this.state.currentJobExperience = 0; 
            this.storage.save(this.state);
            return { success: true };
        }
        return { success: false, reason: "Requisitos não atendidos." };
    }

    addOrUpdateBill(name, amount) {
        let bill = this.state.pendingBills.find(b => b.name === name && b.status !== 'paid');
        if (bill) {
            bill.baseAmount += amount;
            bill.amount = bill.baseAmount * (1 + (bill.interest / 100));
        } else {
            this.state.pendingBills.push({ name, baseAmount: amount, amount, interest: 0, status: 'pending' });
        }
    }

    nextMonth() {
        let monthlyTotalIncome = 0;
        let incomeDetails = [];

        this.state.pendingBills = this.state.pendingBills.filter(b => b.status !== 'paid');
        for (let bill of this.state.pendingBills) {
            bill.interest += 5;
            bill.amount = bill.baseAmount * (1 + (bill.interest / 100));
            if (bill.interest >= 100) return "GAME_OVER";
        }

        GAME_DATA.FIXED_BILLS.forEach(b => this.addOrUpdateBill(b.name, b.cost));

        if (this.state.currentEducation) {
            const edu = GAME_DATA.EDUCATION.find(e => e.id === this.state.currentEducation.id);
            if (edu.cost > 0) this.addOrUpdateBill(`Mensalidade: ${edu.name}`, edu.cost);
            this.state.currentEducation.progress++;
            if (this.state.currentEducation.progress >= edu.duration) {
                this.state.degrees.push(edu.type);
                this.state.degrees.push(edu.name);
                this.state.currentEducation = null;
            }
        }

        // LÓGICA DE ALUGUÉIS (CORRIGIDA)
        this.state.ownedAssets.houses.forEach(house => {
            const data = GAME_DATA.PROPERTIES.find(p => p.id === house.id);
            if (!data) return;
            if (house.isRented) {
                if (house.vacancyRemaining > 0) {
                    house.vacancyRemaining--;
                    if (house.vacancyRemaining === 0) {
                        this.state.newsHistory.unshift({
                            title: "Novo Inquilino!",
                            description: `O seu imóvel "${data.name}" foi ocupado. O aluguel voltará a ser creditado.`,
                            target: 'Imobiliário', impact: 0, type: 'pos', local: data.local, month: this.state.month
                        });
                    }
                    this.addOrUpdateBill(`Manutenção (Vago): ${data.name}`, data.maintenance);
                } else {
                    // FIX: Multiplicador de 0.5% (0.005) - Antes estava 0.08
                    const rentAmount = data.price * 0.005;
                    this.state.balance += rentAmount;
                    monthlyTotalIncome += rentAmount;
                    incomeDetails.push({ name: `Aluguel: ${data.name}`, amount: rentAmount, type: 'rental' });
                    
                    if (Math.random() < 0.10) {
                        house.vacancyRemaining = Math.floor(Math.random() * 6) + 1;
                        this.state.newsHistory.unshift({
                            title: "Imóvel Desocupado",
                            description: `O inquilino de "${data.name}" saiu. O imóvel ficará vago por aprox. ${house.vacancyRemaining} meses.`,
                            target: 'Imobiliário', impact: 0, type: 'neg', local: data.local, month: this.state.month
                        });
                    }
                }
            } else {
                this.addOrUpdateBill(`Manutenção: ${data.name}`, data.maintenance);
            }
        });

        this.state.ownedAssets.vehicles.forEach(vId => {
            const v = GAME_DATA.VEHICLES.find(p => p.id === vId);
            if (v && v.maintenance > 0) this.addOrUpdateBill(`Manutenção: ${v.name}`, v.maintenance);
        });

        if (this.state.jobId) {
            const job = GAME_DATA.JOBS.find(j => j.id === this.state.jobId);
            const bonusPercent = this.calculateSalaryBonus();
            
            if (this.state.currentJobExperience > 0 && this.state.currentJobExperience % 12 === 0 && bonusPercent < 1.0) {
                this.state.newsHistory.unshift({
                    title: "Aumento Salarial!",
                    description: `Parabéns! Pela sua fidelidade de ${Math.floor(this.state.currentJobExperience/12)} ano(s) no cargo de ${job.name}, você recebeu 10% de aumento!`,
                    target: 'Carreira', impact: 0.1, type: 'pos', local: '/img/Noticias/aumentoSalarial.png', month: this.state.month
                });
            }

            const finalSalary = job.salary * (1 + bonusPercent);
            this.state.balance += finalSalary;
            monthlyTotalIncome += finalSalary;
            
            incomeDetails.push({ 
                name: `Salário: ${job.name}`, 
                amount: finalSalary, 
                type: 'salary', 
                bonus: bonusPercent > 0 ? `${(bonusPercent * 100).toFixed(0)}%` : null 
            });
            this.state.experience++; 
            this.state.currentJobExperience++; 
        }

        this.market.updateMarketCycle();
        const marketNews = this.market.generateNews();
        this.state.newsHistory.unshift({ ...marketNews, month: this.state.month });

        this.state.portfolio.forEach(pos => {
            const asset = this.market.assets.find(a => a.id === pos.id);
            if (['Tesouro', 'CDB', 'LCI/LCA'].includes(asset.type)) {
                const yieldRate = this.market.calculateYield(pos.id);
                const yieldAmount = pos.avgPrice * yieldRate;
                pos.avgPrice += yieldAmount;
                monthlyTotalIncome += yieldAmount;
                incomeDetails.push({ name: asset.name, amount: yieldAmount, type: 'dividend', isFixed: true });
            } else {
                let pays = (!asset.periodicity || asset.periodicity === 'mensal');
                if (!pays && asset.periodicity === 'semestral' && this.state.month % 6 === 0) pays = true;
                if (!pays && asset.periodicity === 'anual' && this.state.month % 12 === 0) pays = true;
                
                if (pays) {
                    const impact = this.market.activeImpacts[asset.sector] || 0;
                    const divPerCota = Math.round(asset.baseDividend * (1 + impact) * 100) / 100;
                    const totalDiv = divPerCota * pos.qty;
                    if (totalDiv > 0) {
                        this.state.balance += totalDiv;
                        monthlyTotalIncome += totalDiv;
                        
                        let reinvestmentInfo = null;
                        if (this.state.upgrades.includes('auto_reinvest')) {
                            const trigger = asset.price * 1.20;
                            if (totalDiv >= trigger) {
                                const qtyToBuy = Math.floor((totalDiv * 0.8) / asset.price);
                                if (qtyToBuy > 0) {
                                    const cost = asset.price * qtyToBuy;
                                    this.state.balance -= cost;
                                    pos.qty += qtyToBuy;
                                    pos.principal += cost;
                                    reinvestmentInfo = { qty: qtyToBuy, cost: cost, leftover: totalDiv - cost };
                                }
                            }
                        }
                        incomeDetails.push({ name: asset.name, amount: totalDiv, qty: pos.qty, type: 'dividend', reinvested: reinvestmentInfo });
                    }
                }
            }
        });

        if (this.state.upgrades && this.state.upgrades.includes('auto_pay')) {
            const pending = this.state.pendingBills.filter(b => b.status === 'pending');
            const totalToPay = pending.reduce((acc, b) => acc + b.amount, 0);
            if (totalToPay > 0 && this.state.balance >= totalToPay) {
                this.state.balance -= totalToPay;
                pending.forEach(b => b.status = 'paid');
                this.state.newsHistory.unshift({
                    title: "Assistente Financeiro",
                    description: `Suas contas do mês totalizando R$ ${totalToPay.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} foram pagas automaticamente.`,
                    target: 'Financeiro', impact: 0, type: 'pos', local: '/img/Noticias/ContasPagas.png', month: this.state.month
                });
            }
        }

        this.state.incomeHistory.push({ month: this.state.month, total: monthlyTotalIncome, details: incomeDetails });
        if (this.state.incomeHistory.length > 12) this.state.incomeHistory.shift();

        this.state.month++;
        this.storage.save(this.state);
        return null;
    }

    buyUpgrade(upgradeId) {
        const upgrade = GAME_DATA.UPGRADES.find(u => u.id === upgradeId);
        if (upgrade && !this.state.upgrades.includes(upgradeId) && this.state.balance >= upgrade.cost) {
            this.state.balance -= upgrade.cost;
            this.state.upgrades.push(upgradeId);
            this.storage.save(this.state);
            return true;
        }
        return false;
    }

    payBill(index) {
        const bill = this.state.pendingBills[index];
        if (bill && this.state.balance >= bill.amount) {
            this.state.balance -= bill.amount;
            bill.status = 'paid';
            this.storage.save(this.state);
            return true;
        }
        return false;
    }

    payAllBills() {
        const pending = this.state.pendingBills.filter(b => b.status === 'pending');
        const total = pending.reduce((acc, b) => acc + b.amount, 0);
        if (total > 0 && this.state.balance >= total) {
            this.state.balance -= total;
            pending.forEach(b => b.status = 'paid');
            this.storage.save(this.state);
            return { success: true };
        }
        return { success: false, reason: "Saldo insuficiente." };
    }

    buyAsset(id, amount) {
        const asset = this.market.assets.find(a => a.id === id);
        const cost = asset.price ? asset.price * amount : amount;
        if (this.state.balance >= cost) {
            this.state.balance -= cost;
            let pos = this.state.portfolio.find(p => p.id === id);
            if (!pos) {
                pos = { id, qty: 0, avgPrice: 0, principal: 0 };
                this.state.portfolio.push(pos);
            }
            if (asset.price) {
                const totalVal = (pos.qty * pos.avgPrice) + (asset.price * amount);
                pos.qty += amount;
                pos.avgPrice = totalVal / pos.qty;
                pos.principal += (asset.price * amount);
            } else {
                pos.avgPrice += amount;
                pos.qty = 1;
                pos.principal += amount;
            }
            this.storage.save(this.state);
            return true;
        }
        return false;
    }

    sellAsset(id, amount) {
        const idx = this.state.portfolio.findIndex(p => p.id === id);
        if (idx === -1) return false;
        const pos = this.state.portfolio[idx];
        const asset = this.market.assets.find(a => a.id === id);
        if (asset.price) {
            if (pos.qty >= amount) {
                const ratio = amount / pos.qty;
                this.state.balance += asset.price * amount;
                pos.qty -= amount;
                pos.principal -= pos.principal * ratio;
                if (pos.qty <= 0) this.state.portfolio.splice(idx, 1);
                this.storage.save(this.state);
                return true;
            }
        } else {
            if (pos.avgPrice >= amount) {
                const ratio = amount / pos.avgPrice;
                this.state.balance += amount;
                pos.avgPrice -= amount;
                pos.principal -= pos.principal * ratio;
                if (pos.avgPrice <= 0) this.state.portfolio.splice(idx, 1);
                this.storage.save(this.state);
                return true;
            }
        }
        return false;
    }

    buyPhysicalAsset(type, itemId) {
        const list = type === 'house' ? GAME_DATA.PROPERTIES : GAME_DATA.VEHICLES;
        const item = list.find(i => i.id === itemId);
        if (this.state.balance >= item.price) {
            this.state.balance -= item.price;
            if (type === 'house') {
                this.state.ownedAssets.houses.push({ id: itemId, isRented: false, vacancyRemaining: 0 });
            } else {
                this.state.ownedAssets.vehicles.push(itemId);
            }
            this.storage.save(this.state);
            return true;
        }
        return false;
    }

    toggleRental(index) {
        const house = this.state.ownedAssets.houses[index];
        if (house) {
            house.isRented = !house.isRented;
            if (house.isRented) house.vacancyRemaining = 0;
            this.storage.save(this.state);
            return true;
        }
        return false;
    }
}