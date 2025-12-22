/**
 * STORAGE.JS
 * Responsabilidade: Gerenciar persistência de dados.
 * (Princípio: Single Responsibility)
 */

class StorageService {
    constructor() {
        this.dbName = 'SimInvest_LocalDB';
        this.storeName = 'gameState';
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };
            request.onerror = (e) => reject("Erro ao abrir IndexedDB");
        });
    }

    async save(data) {
        const tx = this.db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put(data, 'current_save');
        return tx.complete;
    }

    async load() {
        return new Promise((resolve) => {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const request = tx.objectStore(this.storeName).get('current_save');
            request.onsuccess = () => resolve(request.result);
        });
    }
}