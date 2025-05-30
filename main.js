import MonsterParser from "./MonsterParser.js";
import ItemParser from "/ItemParser.js";
import MonsterCardRenderer from "./MonsterCardRenderer.js";

let monsterList = [];

async function loadItems() {
    try {
        const response = await fetch("/items-complete.json");
        const json = await response.json();

        const parser = new ItemParser(json);
        const filtered = parser.groupByWikiName();
        const filteredParser = new ItemParser(filtered);

        const equipableItems = filteredParser.getEquipableItems();
        const weapons = filteredParser.getEquipableWeapons();
        const helmets = filteredParser.getItemsBySlot("head");
        const excalibur = filteredParser.searchItemsByName("Excalibur");

        // const allItems = parser.getAllItems();

        // console.log("All Items:", allItems);
        console.log("Equipable Items:", equipableItems);
        console.log("Weapons:", weapons);
        console.log("Helmets:", helmets);
        console.log("Search Result for 'Excalibur':", excalibur);
    } catch (error) {
        console.error("Error fetching or parsing items JSON:", error);
    }
}

async function loadMonsters() {
    try {
        const response = await fetch("/monsters-complete.json");
        const json = await response.json();
        console.log(json);
        const parser = new MonsterParser(json);
        monsterList = parser.narrowMonsterList();
        console.log(monsterList);
        if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
            const manager = new MonsterCardRenderer({
                cardTemplate: "#monsterCardTemplate",
                cardContainer: "#monster-container",
                data: monsterList,
                limit: 20,
            });

            manager.loadMore(); // Initial load

            // Optional: Load more button
            document.getElementById("loadMoreBtn").addEventListener("click", () => {
                manager.loadMore();
                if (!manager.hasMore()) {
                    document.getElementById("loadMoreBtn").style.display = "none";
                }
            });
        }
        //renderMonsterCards(monsterList.slice(0, 100)); // Limit to first 100
    } catch (error) {
        console.error("Error fetching or parsing monsters JSON:", error);
    }
}

loadItems();
loadMonsters();
