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

        const parser = new MonsterParser(json);
        const monsterList = parser.narrowMonsterList();

        renderMonsterCards(monsterList.slice(0, 100)); // Limit to first 100
    } catch (error) {
        console.error("Error fetching or parsing monsters JSON:", error);
    }
}

function renderMonsterCards(monsters) {
    const container = document.getElementById("monster-container");
    if (!container) return;

    monsters.forEach((monster) => {
        const m = monster.monsterData;

        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
      <h2>${m.monsterName}</h2>
      <p><strong>Combat Level:</strong> ${m.combat_level}</p>
      <p><strong>Hitpoints:</strong> ${m.stats.hitpoints}</p>
      <p><strong>Attack Level:</strong> ${m.stats.attack_level}</p>
      <p><strong>Defence Level:</strong> ${m.stats.defence_level}</p>
      <p><strong>Magic Level:</strong> ${m.stats.magic_level}</p>
      <p><strong>Attributes:</strong> ${m.stats.attributes.join(", ")}</p>
      <p><strong>Slayer Level:</strong> ${m.slayerInfo?.slayer_level ?? "N/A"}</p>
      <p><a href="${m.metaInfo.wiki_url}" target="_blank">View on Wiki</a></p>
    `;

        container.appendChild(card);
    });
}

loadItems();
loadMonsters();
