/**
 * MAIN.JS
 * Responsabilidade: Inicializar a aplicação (Composition Root).
 */

const storage = new StorageService();
const market = new MarketService();
const game = new GameController(storage, market);
let ui; // Global para facilitar acesso via onclick (em apps reais usaríamos eventos delegados)

window.onload = async () => {
    try {
        await storage.init();
        await game.init();
        
        ui = new UIManager(game);
        ui.render();
        
        console.log("SimInvest inicializado com sucesso.");
    } catch (err) {
        console.error("Falha na inicialização:", err);
    }
};