import MonsterParser from "./MonsterParser.js";
import ItemParser from "/ItemParser.js";

fetch("./items-complete.json")
    .then((response) => response.json())
    .then((json) => {
        const parser = new ItemParser(json);

        const equipableItems = parser.getEquipableItems();
        const weapons = parser.getEquipableWeapons();
        const helmets = parser.getItemsBySlot("head");
        const excalibur = parser.searchItemsByName("Excalibur");
        const allItems = parser.getAllItems();

        console.log("All Items:", allItems);
        console.log("Equipable Items:", equipableItems);
        console.log("Weapons:", weapons);
        console.log("Helmets:", helmets);
        console.log("Search Result for 'Excalibur':", excalibur);
    })
    .catch((error) => console.error("Error fetching or parsing JSON:", error));

fetch("/monsters-complete.json")
    .then((response) => response.json())
    .then((json) => {
        console.log(json);
        const parser = new MonsterParser(json);

        const newMonsterList = parser.narrowMonsterList();

        console.log(newMonsterList);
    });
