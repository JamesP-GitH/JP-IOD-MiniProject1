import MonsterParser from "./MonsterParser.js";
import ItemParser from "/ItemParser.js";
import MonsterCardRenderer from "./MonsterCardRenderer.js";
import ItemCardRenderer from "./ItemCardRenderer.js";
import PrayerParser from "./PrayerParser.js";
import PrayerCardRenderer from "./PrayerCardRenderer.js";

let monsterList = [];
let itemList = [];
let prayerList = [];

async function loadItems() {
    try {
        const response = await fetch("/items-complete.json");
        const json = await response.json();

        const parser = new ItemParser(json);
        itemList = parser.groupByWikiName();

        if (window.location.pathname === "/itemsDB.html") {
            FilterRenderItems();
        }
    } catch (error) {
        console.error("Error fetching or parsing items JSON:", error);
    }
}

async function loadMonsters() {
    try {
        const response = await fetch("/monsters-complete.json");
        const json = await response.json();
        const parser = new MonsterParser(json);
        monsterList = parser.narrowMonsterList();

        // Only render after monsters are loaded
        if (window.location.pathname === "/monstersDB.html") {
            FilterRenderMonsters();
        }

        //renderMonsterCards(monsterList.slice(0, 100)); // Limit to first 100
    } catch (error) {
        console.error("Error fetching or parsing monsters JSON:", error);
    }
}

async function loadPrayers() {
    try {
        const response = await fetch("/prayers-complete.json");
        const json = await response.json();
        const parser = new PrayerParser(json);
        prayerList = parser.returnPrayers();

        if (window.location.pathname === "/prayersDB.html") {
            FilterRenderPrayers();
        }

        console.log(prayerList);
    } catch (error) {
        console.error("Error fetching or parsing prayers JSON:", error);
    }
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

function SortItems(items, sortOption) {
    const sorted = [...items];

    switch (sortOption) {
        case "name-asc":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case "cost-high":
            return sorted.sort((a, b) => b.cost - a.cost);
        case "cost-low":
            return sorted.sort((a, b) => a.cost - b.cost);
        default:
            return sorted;
    }
}

function SortPrayers(prayers, sortOption) {
    const sorted = [...prayers];

    switch (sortOption) {
        case "name-asc":
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
            return sorted.sort((a, b) => b.name.localeCompare(a.name));
        case "req-high":
            return sorted.sort((a, b) => {
                const aReqs = Object.values(a.requirements || {});
                const bReqs = Object.values(b.requirements || {});

                // Sort by number of requirements (descending)
                if (bReqs.length !== aReqs.length) {
                    return bReqs.length - aReqs.length;
                }

                // Sort by max requirement value (descending)
                const maxA = Math.max(...aReqs);
                const maxB = Math.max(...bReqs);
                if (maxB !== maxA) {
                    return maxB - maxA;
                }

                // Fallback: alphabetical by name
                return a.name.localeCompare(b.name);
            });
        case "req-low":
            return sorted.sort((a, b) => {
                const aReqs = Object.values(a.requirements || {});
                const bReqs = Object.values(b.requirements || {});

                // Sort by number of requirements (ascending)
                if (aReqs.length !== bReqs.length) {
                    return aReqs.length - bReqs.length;
                }

                // Sort by max requirement value (ascending)
                const maxA = Math.max(...aReqs);
                const maxB = Math.max(...bReqs);
                if (maxA !== maxB) {
                    return maxA - maxB;
                }

                // Fallback: alphabetical by name
                return a.name.localeCompare(b.name);
            });
        default:
            return sorted;
    }
}

function FilterRenderMonsters() {
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

function FilterRenderItems() {
    const selectedCategory = categorySelect.value.toLowerCase();
    const query = searchInput.value.toLowerCase().trim();
    const sortOption = sortSelect.value;

    const filtered = itemList.filter((item) => {
        const name = item.name.toLowerCase();

        const isMembers = item.members;
        const isQuestItem = item.quest_item;
        const isStackable = item.stackable;
        const isEquipable = item.equipable_by_player;

        const matchName = name.includes(query);

        // Category Filtering Logic
        let matchCategory = true;
        switch (selectedCategory) {
            case "members":
                matchCategory = isMembers === true;
                break;
            case "free-to-play":
                matchCategory = isMembers === false;
                break;
            case "quest-item":
                matchCategory = isQuestItem === true;
                break;
            case "stackable":
                matchCategory = isStackable === true;
                break;
            case "equipable":
                matchCategory = isEquipable === true;
                break;
            case "non-equipable":
                matchCategory = isEquipable === false;
                break;
            case "weapon":
            case "head":
            case "body":
            case "shield":
            case "legs":
            case "hands":
            case "feet":
            case "cape":
            case "neck":
            case "ring":
            case "ammo":
                matchCategory = item.equipment?.slot === selectedCategory;
                break;
            case "all":
            default:
                matchCategory = true;
        }

        return matchName && matchCategory;
    });

    const sorted = SortItems(filtered, sortOption);

    // Clear the container
    document.querySelector("#itemCardContainer").innerHTML = "";

    // Render using ItemCardRenderer
    const manager = new ItemCardRenderer({
        cardTemplate: "#itemCardTemplate",
        cardContainer: "#itemCardContainer",
        data: sorted,
        limit: 30,
    });

    manager.loadMore();

    // Load more hook
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn.style.display = manager.hasMore() ? "block" : "none";
    loadMoreBtn.onclick = () => {
        manager.loadMore();
        if (!manager.hasMore()) {
            loadMoreBtn.style.display = "none";
        }
    };
}

function FilterRenderPrayers() {
    const selectedCategory = categorySelect.value.toLowerCase();
    const query = searchInput.value.toLowerCase().trim();
    const sortOption = sortSelect.value;

    const bonusCategoryMap = {
        "attack-bonus": "attack",
        "defence-bonus": "defence",
        "strength-bonus": "strength",
        "ranged-bonus": "ranged",
        "magic-bonus": "magic",
    };

    const filtered = prayerList.filter((prayer) => {
        const name = prayer.name.toLowerCase();

        const isMembers = prayer.members;
        const bonuses = prayer.bonuses || [];

        const matchName = name.includes(query);

        // Category Filtering Logic
        let matchCategory = true;
        switch (selectedCategory) {
            case "members":
                matchCategory = isMembers === true;
                break;
            case "free-to-play":
                matchCategory = isMembers === false;
                break;
            case "attack-bonus":
            case "defence-bonus":
            case "strength-bonus":
            case "ranged-bonus":
            case "magic-bonus":
                const bonusKey = bonusCategoryMap[selectedCategory];
                matchCategory = bonuses[bonusKey] && bonuses[bonusKey] > 0;
                break;
            case "other":
                const knownBonusKeys = Object.values(bonusCategoryMap);
                matchCategory = !knownBonusKeys.some((key) => bonuses[key] && bonuses[key] > 0);
                break;
            case "all":
            default:
                matchCategory = true;
        }

        return matchName && matchCategory;
    });

    const sorted = SortPrayers(filtered, sortOption);

    document.querySelector("#prayerCardContainer").innerHTML = "";

    const manager = new PrayerCardRenderer({
        cardTemplate: "#prayerCardTemplate",
        cardContainer: "#prayerCardContainer",
        data: sorted,
    });

    manager.loadMore();
}

if (window.location.pathname === "/monstersDB.html") {
    categorySelect.addEventListener("change", FilterRenderMonsters);
    searchInput.addEventListener("input", FilterRenderMonsters);
    sortSelect.addEventListener("change", FilterRenderMonsters);
    searchInput2.addEventListener("change", FilterRenderMonsters);
}

if (window.location.pathname === "/itemsDB.html") {
    categorySelect.addEventListener("change", FilterRenderItems);
    searchInput.addEventListener("input", FilterRenderItems);
    sortSelect.addEventListener("change", FilterRenderItems);
}

if (window.location.pathname === "/prayersDB.html") {
    categorySelect.addEventListener("change", FilterRenderPrayers);
    searchInput.addEventListener("input", FilterRenderPrayers);
    sortSelect.addEventListener("change", FilterRenderPrayers);
}

if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
    if (window.location.pathname === "/monstersDB.html") {
        loadMonsters();
    }
    if (window.location.pathname === "/itemsDB.html") {
        loadItems();
    }
    if (window.location.pathname === "/prayersDB.html") {
        loadPrayers();
    }
}
