import ItemParser from "/ItemParser.js";

fetch("https://raw.githubusercontent.com/0xNeffarion/osrsreboxed-db/master/docs/items-complete.json")
    .then((response) => response.json())
    .then((json) => {
        const parser = new ItemParser(json);

        const equipableItems = parser.getEquipableItems();
        const weapons = parser.getEquipableWeapons();
        const helmets = parser.getItemsBySlot("head");
        const excalibur = parser.searchItemsByName("Excalibur");

        console.log("Equipable Items:", equipableItems);
        console.log("Weapons:", weapons);
        console.log("Helmets:", helmets);
        console.log("Search Result for 'Excalibur':", excalibur);
    })
    .catch((error) => console.error("Error fetching or parsing JSON:", error));
