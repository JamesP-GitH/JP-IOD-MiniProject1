import MonsterParser from "./MonsterParser.js";
import ItemParser from "/ItemParser.js";

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
        const newMonsterList = parser.narrowMonsterList();

        console.log(newMonsterList);
    } catch (error) {
        console.error("Error fetching or parsing monsters JSON:", error);
    }
}

loadItems();
loadMonsters();
