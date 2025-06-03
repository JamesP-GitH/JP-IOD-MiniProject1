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
                limit: 30,
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

function addCard(monster) {
    const manager = new MonsterCardRenderer({
        cardTemplate: "#monsterCardTemplate",
        cardContainer: "#monster-container",
        data: monster,
        limit: 30,
    });

    manager.loadMore();

    document.getElementById("loadMoreBtn").addEventListener("click", () => {
        manager.loadMore();
        if (!manager.hasMore()) {
            document.getElementById("loadMoreBtn").style.display = "none";
        }
    });
}

const categorySelect = document.getElementById("categorySelect") || "";
const searchInput = document.getElementById("searchInput") || "";
const sortSelect = document.getElementById("sortSelect") || "";
const searchInput2 = document.getElementById("searchInput2") || "";

function SortMonsters(monsters, sortOption) {
    const sorted = [...monsters]; // duplicate array

    switch (sortOption) {
        case "comLvl-asc":
            sorted.sort((a, b) => a.monsterData.combat_level - b.monsterData.combat_level);
            break;
        case "comLvl-desc":
            sorted.sort((a, b) => b.monsterData.combat_level - a.monsterData.combat_level);
            break;
        case "title-asc":
            sorted.sort((a, b) => a.monsterData.monsterName.localeCompare(b.monsterData.monsterName));
            break;
        case "title-desc":
            sorted.sort((a, b) => b.monsterData.monsterName.localeCompare(a.monsterData.monsterName));
            break;
        default:
            break;
    }

    return sorted;
}

function FilterRender() {
    if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
        const selectedCategory = categorySelect.value.toLowerCase();
        const query = searchInput.value.toLowerCase().trim();
        const sortOption = sortSelect.value;
        const queryMonsterLevel = searchInput2.value;

        const filtered = monsterList.filter((monster) => {
            const title = monster.monsterData.monsterName.toLowerCase();
            const comLevel = monster.monsterData.combat_level;

            // Category Filtering Logic
            const slayer = monster.monsterData.slayerInfo.slayer_monster;
            const members = monster.monsterData.metaInfo.members;
            const attributes = monster.monsterData.stats.attributes || [];
            const attackTypes = monster.monsterData.stats.attack_type || [];

            const matchTitle = title.includes(query);
            const matchLevel = queryMonsterLevel === "" || Number(comLevel) === Number(queryMonsterLevel);

            // Determine matchCategory based on selectedCategory
            let matchCategory = true;
            switch (selectedCategory) {
                case "slayer-monster":
                    matchCategory = slayer === true;
                    break;
                case "members":
                    matchCategory = members === true;
                    break;
                case "free-to-play":
                    matchCategory = members === false;
                    break;
                case "demon":
                case "dragon":
                case "fiery":
                case "golem":
                case "kalphite":
                case "leafy":
                case "penance":
                case "rat":
                case "shade":
                case "spectral":
                case "undead":
                case "vampyre":
                case "xerician":
                    matchCategory = attributes.includes(selectedCategory);
                    break;
                case "crush":
                case "stab":
                case "slash":
                case "magic":
                case "ranged":
                    matchCategory = attackTypes.includes(selectedCategory);
                    break;
                case "allmelee":
                    matchCategory = attackTypes.some((type) => ["melee", "stab", "crush", "slash"].includes(type));
                    break;
                case "all":
                default:
                    matchCategory = true;
            }

            return matchTitle && matchCategory && matchLevel;
        });

        const sorted = SortMonsters(filtered, sortOption);

        // Clear the container
        document.querySelector("#monster-container").innerHTML = "";

        // Render using MonsterCardRenderer correctly
        const manager = new MonsterCardRenderer({
            cardTemplate: "#monsterCardTemplate",
            cardContainer: "#monster-container",
            data: sorted,
            limit: 30,
        });

        manager.loadMore();

        // Hook up Load More again
        const loadMoreBtn = document.getElementById("loadMoreBtn");
        loadMoreBtn.style.display = manager.hasMore() ? "block" : "none";
        loadMoreBtn.onclick = () => {
            manager.loadMore();
            if (!manager.hasMore()) {
                loadMoreBtn.style.display = "none";
            }
        };
    }
}

categorySelect.addEventListener("change", FilterRender);
searchInput.addEventListener("input", FilterRender);
sortSelect.addEventListener("change", FilterRender);
searchInput2.addEventListener("change", FilterRender);

if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
    loadItems();
    loadMonsters();
    FilterRender();
}
