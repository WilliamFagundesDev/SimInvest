/**
 * DATA.JS
 * Responsabilidade: Armazenar constantes, requisitos e caminhos de imagens.
 */

const GAME_DATA = {
    JOBS: [
        { id: 'j1', name: 'Entregador de Aplicativo', salary: 1600, req: 'Fundamental', exp: 0, vehicleReq: 'v0' },
        { id: 'j2', name: 'Repositor de Estoque', salary: 2100, req: 'Ensino Médio', exp: 0 },
        { id: 'j3', name: 'Assistente Administrativo', salary: 2800, req: 'Ensino Médio', exp: 6 },
        { id: 'j4', name: 'Analista Financeiro Jr', salary: 4500, req: 'Superior', exp: 0, eduReq: 'Graduação em Economia' },
        { id: 'j5', name: 'Gerente Comercial', salary: 8200, req: 'Superior', exp: 24 },
        { id: 'j6', name: 'CFO (Diretor Financeiro)', salary: 22000, req: 'MBA', exp: 60 }
    ],

    EDUCATION: [
        { id: 'e1', name: 'Ensino Médio', cost: 0, duration: 18, type: 'Ensino Médio', req: 'Fundamental' },
        { id: 'e2', name: 'Graduação em Economia', cost: 950, duration: 48, type: 'Superior', req: 'Ensino Médio' },
        { id: 'e3', name: 'Graduação em T.I.', cost: 1100, duration: 48, type: 'Superior', req: 'Ensino Médio' },
        { id: 'e4', name: 'MBA Executivo', cost: 2200, duration: 24, type: 'MBA', req: 'Superior' }
    ],

    MARKET: [
        { id: 'selic', name: 'Tesouro Selic', type: 'Tesouro', sector: 'Governo', baseYield: 0.009, volatility: 0.001 },
        { id: 'cdb_pos', name: 'CDB 100% CDI', type: 'CDB', sector: 'Bancos', baseYield: 0.0085, volatility: 0.002 },
        { id: 'lca_agro', name: 'LCA Agronegócio', type: 'LCI/LCA', sector: 'Agronegócio', baseYield: 0.0078, volatility: 0.001 },
        { id: 'bcff11', name: 'BCFF11', type: 'FII', sector: 'Fundos de Fundos', price: 9.20, baseDividend: 0.07, baseYield: 0.008, volatility: 0.02, periodicity: 'mensal' },
        { id: 'hglg11', name: 'HGLG11', type: 'FII', sector: 'Logística', price: 165.00, baseDividend: 1.10, baseYield: 0.007, volatility: 0.015, periodicity: 'mensal' },
        { id: 'vale3', name: 'VALE3', type: 'Ações', sector: 'Mineração', price: 68.40, baseDividend: 2.80, baseYield: 0.004, volatility: 0.06, periodicity: 'semestral' },
        { id: 'itub4', name: 'ITUB4', type: 'Ações', sector: 'Bancos', price: 32.10, baseDividend: 0.22, baseYield: 0.005, volatility: 0.04, periodicity: 'mensal' },
        { id: 'wege3', name: 'WEGE3', type: 'Ações', sector: 'Indústria', price: 38.90, baseDividend: 1.15, baseYield: 0.003, volatility: 0.05, periodicity: 'anual' }
    ],

    FIXED_BILLS: [
        { id: 'b1', name: 'Aluguel (Moradia)', cost: 800 },
        { id: 'b2', name: 'Internet e Luz', cost: 250 },
        { id: 'b3', name: 'Alimentação', cost: 600 }
    ],

    PROPERTIES: [
        { id: 'h1', name: 'Apartamento Padrão', price: 250000, maintenance: 450, level: 1, local: './img/Imoveis/Apartamento Padrao.png' },
        { id: 'h2', name: 'Casa de Condomínio', price: 650000, maintenance: 1200, level: 2, local: './img/Imoveis/Casa Condominio.png' },
        { id: 'h3', name: 'Cobertura de Luxo', price: 1800000, maintenance: 4500, level: 3, local: './img/Imoveis/Cobertura Luxo.png' }
    ],

    VEHICLES: [
        { id: 'v0', name: 'Bicicleta Simples', price: 600, maintenance: 20, level: 0, local: './img/Carros/Bicicleta.png' },
        { id: 'v1', name: 'Carro Usado', price: 35000, maintenance: 300, level: 1, local: './img/Carros/Carro Usado.png' },
        { id: 'v2', name: 'Sedan Zero KM', price: 120000, maintenance: 800, level: 2, local: './img/Carros/Sedan Zero.png' },
        { id: 'v3', name: 'Esportivo de Luxo', price: 450000, maintenance: 2500, level: 3, local: './img/Carros/Esportivo Luxo.png' },
        { id: 'v4', name: 'Super Carro', price: 1000000, maintenance: 10000, level: 4, local: './img/Carros/Super Carro.png' }
    ],

    UPGRADES: [
        { id: 'auto_pay', name: 'Pagar conta automática', cost: 30000, description: 'Paga automaticamente as contas se houver saldo suficiente (Contas + 10%).' },
        { id: 'auto_reinvest', name: 'Auto re-investir Ativos', cost: 50000, description: 'Compra cotas automaticamente de FIIs e Ações se o dividendo recebido for >= preço da cota + 20%.' }
    ],

    NEWS_TEMPLATES: [
        { 
            title: "Copom mantém Selic elevada", 
            description: "A taxa de juros permanece em patamares altos para conter a inflação, beneficiando a renda fixa.", 
            target: 'Governo', impact: 0.1, type: 'pos', local: './img/Noticias/governo.png'
        },
        { 
            title: "Logística em alta no interior", 
            description: "Abertura de novos centros logísticos aumenta os aluguéis de galpões e o rendimento de FIIs.", 
            target: 'Logística', impact: 0.15, type: 'pos', local: './img/Noticias/logistica.png'
        },
        { 
            title: "Preço do minério despenca", 
            description: "Pressão internacional sobre commodities afeta o resultado trimestral de empresas mineiras.", 
            target: 'Mineração', impact: -0.2, type: 'neg', local: './img/Noticias/mineracao.png'
        },
        { 
            title: "Bancos lucram com inadimplência baixa", 
            description: "Setor financeiro apresenta resultados sólidos e anuncia distribuição generosa de dividendos.", 
            target: 'Bancos', impact: 0.12, type: 'pos', local: './img/Noticias/bancos.png'
        },
        { 
            title: "Crise na indústria têxtil", 
            description: "Altos custos de importação de matéria-prima pesam no bolso das indústrias nacionais.", 
            target: 'Indústria', impact: -0.15, type: 'neg', local: './img/Noticias/industria.png'
        }
    ]
};