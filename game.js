/**
 * GAME.JS
 * Responsabilidade: Gerir o estado e as regras de negócio (SOLID - SRP).
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
            degrees: ['Fundamental'],
            currentEducation: null,
            portfolio: [],
            ownedAssets: { house: null, vehicle: null },
            pendingBills: [], 
            incomeHistory: [], 
            newsHistory: []
        };
    }

    async init() {
        const saved = await this.storage.load();
        if (saved) {
            this.state = saved;
            if (!this.state.pendingBills) this.state.pendingBills = [];
            if (!this.state.incomeHistory) this.state.incomeHistory = [];
            // Garantir que rastreamos o capital investido para lucro/prejuízo
            this.state.portfolio.forEach(p => {
                if (p.principal === undefined) p.principal = p.avgPrice * (p.qty || 1);
            });
        }
    }

    // Consolida dívidas: Se já existe uma conta com esse nome, soma o valor e aumenta os juros
    addOrUpdateBill(name, amount) {
        let bill = this.state.pendingBills.find(b => b.name === name);
        if (bill) {
            bill.baseAmount += amount;
            // O juro já foi aumentado no início do nextMonth, não aumentamos aqui para evitar duplicidade
            bill.amount = bill.baseAmount * (1 + (bill.interest / 100));
        } else {
            this.state.pendingBills.push({
                name: name,
                baseAmount: amount,
                amount: amount,
                interest: 0
            });
        }
    }

    nextMonth() {
        let monthlyDividends = 0;
        let dividendsDetails = [];

        // 1. Aumentar juros apenas das contas que JÁ ESTAVAM lá antes de rodar o mês
        for (let bill of this.state.pendingBills) {
            bill.interest += 5;
            bill.amount = bill.baseAmount * (1 + (bill.interest / 100));
            if (bill.interest >= 100) return "GAME_OVER";
        }

        // 2. Adicionar os novos gastos do mês às contas (Consolidado)
        GAME_DATA.FIXED_BILLS.forEach(b => this.addOrUpdateBill(b.name, b.cost));

        if (this.state.currentEducation) {
            const edu = GAME_DATA.EDUCATION.find(e => e.id === this.state.currentEducation.id);
            if (edu.cost > 0) this.addOrUpdateBill(`Mensalidade: ${edu.name}`, edu.cost);
            this.state.currentEducation.progress++;
            if (this.state.currentEducation.progress >= edu.duration) {
                this.state.degrees.push(edu.type);
                this.state.currentEducation = null;
            }
        }

        if (this.state.ownedAssets.house) {
            const h = GAME_DATA.PROPERTIES.find(p => p.id === this.state.ownedAssets.house);
            this.addOrUpdateBill(`Manutenção: ${h.name}`, h.maintenance);
        }
        if (this.state.ownedAssets.vehicle) {
            const v = GAME_DATA.VEHICLES.find(p => p.id === this.state.ownedAssets.vehicle);
            this.addOrUpdateBill(`Manutenção: ${v.name}`, v.maintenance);
        }

        // 3. Processar Renda (Salário)
        if (this.state.jobId) {
            const job = GAME_DATA.JOBS.find(j => j.id === this.state.jobId);
            this.state.balance += job.salary;
            this.state.experience++;
        }

        // 4. Processar Mercado e Dividendos
        this.market.updateMarketCycle();
        const news = this.market.generateNews();
        this.state.newsHistory.unshift({ ...news, month: this.state.month });

        this.state.portfolio.forEach(pos => {
            const asset = this.market.assets.find(a => a.id === pos.id);
            const impact = this.market.activeImpacts[asset.sector] || 0;
            
            if (['Tesouro', 'CDB', 'LCI/LCA'].includes(asset.type)) {
                const yieldRate = this.market.calculateYield(pos.id);
                pos.avgPrice *= (1 + yieldRate);
            } else {
                // Lógica de Periodicidade
                let paysThisMonth = false;
                if (!asset.periodicity || asset.periodicity === 'mensal') paysThisMonth = true;
                else if (asset.periodicity === 'semestral' && this.state.month % 6 === 0) paysThisMonth = true;
                else if (asset.periodicity === 'anual' && this.state.month % 12 === 0) paysThisMonth = true;

                if (paysThisMonth) {
                    const divPerCota = Math.round(asset.baseDividend * (1 + impact) * 100) / 100;
                    const totalDiv = divPerCota * pos.qty;
                    if (totalDiv > 0) {
                        this.state.balance += totalDiv;
                        monthlyDividends += totalDiv;
                        dividendsDetails.push({ name: asset.name, amount: totalDiv, qty: pos.qty });
                    }
                }
            }
        });

        // 5. Histórico (Últimos 12 meses)
        this.state.incomeHistory.push({
            month: this.state.month,
            total: monthlyDividends,
            details: dividendsDetails
        });
        if (this.state.incomeHistory.length > 12) this.state.incomeHistory.shift();

        this.state.month++;
        this.storage.save(this.state);
        return null;
    }

    payBill(index) {
        const idx = parseInt(index);
        const bill = this.state.pendingBills[idx];
        if (bill && this.state.balance >= bill.amount) {
            this.state.balance -= bill.amount;
            this.state.pendingBills.splice(idx, 1);
            this.storage.save(this.state);
            return true;
        }
        return false;
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
            this.state.ownedAssets[type] = itemId;
            this.storage.save(this.state);
            return true;
        }
        return false;
    }
}