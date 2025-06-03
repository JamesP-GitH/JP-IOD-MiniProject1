export default class MonsterCardRenderer {
    constructor({ cardTemplate, cardContainer, data, limit = 30 }) {
        this.template = document.querySelector(cardTemplate);
        if (!this.template) {
            console.error(`Template with ID "${cardTemplate}" not found.`);
        }
        this.container = document.querySelector(cardContainer);
        this.data = data;
        this.limit = limit;
        this.currentIndex = 0;
    }

    populateCard(template, monsterDataObj) {
        const monster = monsterDataObj.monsterData;

        // Basic Info
        template.querySelector(".valName").textContent = monster.monsterName;
        template.querySelector(".valCombatLvl").textContent = `Combat Level: ${monster.combat_level}`;
        template.querySelector(".valExamine").textContent = `"${monster.examine?.[0] || ""}"`;
        template.querySelector(".valIds").textContent = `ID: ${monster.ids?.[0] ?? ""}`;
        template.querySelector(".valAtkType").textContent = `Attack Types: ${monster.stats.attack_type.map(this.capitalize).join(", ")}`;

        // Monster Info
        template.querySelector(".valMemb").textContent = monster.metaInfo.members ? "Yes" : "No";
        template.querySelector(".valSize").textContent = `${monster.commonInfo.size}x${monster.commonInfo.size}`;
        template.querySelector(".valAttribute").textContent = monster.stats.attributes.join(", ") || "None";
        template.querySelector(".valMaxHit").textContent = monster.stats.max_hit;

        // Combat Stats
        template.querySelector(".valHpLvl").textContent = monster.stats.hitpoints;
        template.querySelector(".valAtkLvl").textContent = monster.stats.attack_level;
        template.querySelector(".valStrLvl").textContent = monster.stats.strength_level;
        template.querySelector(".valDefLvl").textContent = monster.stats.defence_level;
        template.querySelector(".valMagicLvl").textContent = monster.stats.magic_level;
        template.querySelector(".valRangeLvl").textContent = monster.stats.ranged_level;

        // Aggressive Stats
        template.querySelector(".valAtkBonus").textContent = this.formatBonus(monster.stats.attack_bonus);
        template.querySelector(".valStrBonus").textContent = this.formatBonus(monster.stats.strength_bonus);
        template.querySelector(".valMagicAtk").textContent = this.formatBonus(monster.stats.attack_magic);
        template.querySelector(".valMagicBonus").textContent = this.formatBonus(monster.stats.magic_bonus);
        template.querySelector(".valRangeAtk").textContent = this.formatBonus(monster.stats.attack_ranged);
        template.querySelector(".valRangeStr").textContent = this.formatBonus(monster.stats.ranged_bonus);

        // Melee Defence
        template.querySelector(".valStabDef").textContent = this.formatBonus(monster.stats.defence_stab);
        template.querySelector(".valSlashDef").textContent = this.formatBonus(monster.stats.defence_slash);
        template.querySelector(".valBluntDef").textContent = this.formatBonus(monster.stats.defence_crush);

        // Magic & Elemental Defence
        template.querySelector(".valMagicDef").textContent = this.formatBonus(monster.stats.defence_magic);
        /*  data set is not new enough to show elemental weakness as is new feature
        template.querySelector(".valEleWeak").textContent = "No elemental weaknesses"; 
        */

        // Ranged Defence
        template.querySelector(".valRangeDef").textContent = this.formatBonus(monster.stats.defence_ranged);

        // Slayer Info
        if (monster.slayerInfo.slayer_monster) {
            template.querySelector(".valSlayerLvl").textContent = monster.slayerInfo.slayer_level;
            template.querySelector(".valSlayerXp").textContent = monster.slayerInfo.slayer_xp;
            template.querySelector(".valSlayerMasters").textContent = monster.slayerInfo.slayer_masters.map(this.capitalize).join(", ");
        } else {
            template.querySelector(".slayer-section").innerHTML = "";
        }

        // Wiki link
        const wikiLink = template.querySelector(".card-footer a");
        if (wikiLink) {
            wikiLink.href = monster.metaInfo.wiki_url;
        }

        // Accordion Ids
        const monsterId = monster.ids[0];
        const uniqueId = `accordion-${monsterId}`;
        const collapseId = `collapse-${uniqueId}`;
        const accordion = template.querySelector(".accordion");
        if (accordion) {
            accordion.setAttribute("id", `${uniqueId}`);
        }

        const collapse = template.querySelector(".accordion-collapse");
        if (collapse) {
            collapse.setAttribute("id", collapseId);
            collapse.setAttribute("data-bs-parent", `#${uniqueId}`);
        }

        const toggleButton = template.querySelector("button.accordion-button");
        if (toggleButton) {
            toggleButton.setAttribute("data-bs-target", `#${collapseId}`);
            toggleButton.setAttribute(`aria-controls`, collapseId);
        }

        // Drops
        const dropsContainer = template.querySelector(".accordion-body");
        if (dropsContainer && monster.commonInfo.drops) {
            const sortedDrops = [...monster.commonInfo.drops].sort((a, b) => b.rarity - a.rarity);
            const tableRows = sortedDrops
                .map((drop) => {
                    let rarityDisplay = "—";

                    if (drop.rarity === 1) {
                        rarityDisplay = "Always";
                    } else if (drop.rarity > 0) {
                        const denominator = Math.round(1 / drop.rarity);
                        rarityDisplay = `1/${denominator}`;
                    }

                    return `
                        <tr>
                            <td class="w-50"><a href="${drop.url}" target="_blank" rel="noopener noreferrer">${drop.name}</a></td>
                            <td class="text-center w-25">${drop.quantity}</td>
                            <td class="text-center w-25">${rarityDisplay}</td>
                        </tr>
                    `;
                })
                .join("");

            dropsContainer.innerHTML = `
        <table class="table custom-striped-table  table-hover align-middle">
            <thead>
                <tr>
                    <th class="w-50">Name</th>
                    <th class="text-center w-25">Quantity</th>
                    <th class="text-center w-25">Rarity</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
        }

        return template;
    }

    loadMore() {
        const nextBatch = this.data.slice(this.currentIndex, this.currentIndex + this.limit);
        nextBatch.forEach((monsterData) => {
            const clone = this.template.content.cloneNode(true);
            this.populateCard(clone, monsterData);
            this.container.appendChild(clone);
        });
        this.currentIndex += this.limit;
    }

    formatBonus(value) {
        return value !== undefined && value !== null ? (value >= 0 ? `+${value}` : `${value}`) : "—";
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    hasMore() {
        return this.currentIndex < this.data.length;
    }
}
