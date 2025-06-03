export default class ItemCardRenderer {
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

    populateCard(template, item) {
        // Basic Info
        template.querySelector(".valName").textContent = item.name;
        template.querySelector(".valIds").textContent = `ID: ${item.ids?.[0] ?? "N/A"}`;
        template.querySelector(".valExamine").textContent = `"${item.examine}"`;

        // Icon
        const iconElement = template.querySelector(".valIcon");
        if (item.ids !== undefined) {
            const rangeStart = Math.floor(item.ids / 100) * 100;
            const rangeEnd = rangeStart + 99;
            const folderName = `(${rangeStart}-${rangeEnd})`;
            iconElement.src = `./items-icons/${folderName}/${item.ids}.png`;
        }

        // Info Section
        template.querySelector(".valMembers").textContent = item.members ? "Yes" : "No";
        template.querySelector(".valQuestItem").textContent = item.quest_item ? "Yes" : "No";
        template.querySelector(".valStackable").textContent = item.stackable ? "Yes" : "No";
        template.querySelector(".valWeight").textContent = item.weight?.toFixed(2) ?? "0.00";
        template.querySelector(".valEquipable").textContent = item.equipable_by_player ? "Yes" : "No";
        template.querySelector(".valTrade").textContent = item.tradeable ? "Yes" : "No";
        template.querySelector(".valNote").textContent = item.noteable ? "Yes" : "No";
        template.querySelector(".valGE").textContent = item.tradeable_on_ge ? "Yes" : "No";
        if (item.equipment) {
            template.querySelector(".valSlot").textContent = this.capitalize(item.equipment.slot);
        } else {
            template.querySelector("#slotCont").style.display = "none";
        }

        // Economy
        template.querySelector(".valCost").textContent = item.cost;
        template.querySelector(".valHighAlch").textContent = item.highalch;
        template.querySelector(".valLowAlch").textContent = item.lowalch;
        if (item.weapon) {
            template.querySelector(".valAtkSpeed").textContent = `${item.weapon.attack_speed} ticks`;
            template.querySelector(".valWepType").textContent = this.formatUnderscoreString(item.weapon.weapon_type);
            template.querySelector(".valStance").textContent = this.getFormattedStances(item.weapon.stances);
        } else {
            template.querySelector("#weapon-info").textContent = "";
        }
        // Equipment Stats
        if (item.equipment) {
            template.querySelector(".valAtkStab").textContent = this.formatBonus(item.equipment.attack_stab);
            template.querySelector(".valAtkSlash").textContent = this.formatBonus(item.equipment.attack_slash);
            template.querySelector(".valAtkCrush").textContent = this.formatBonus(item.equipment.attack_crush);
            template.querySelector(".valAtkMagic").textContent = this.formatBonus(item.equipment.attack_magic);
            template.querySelector(".valAtkRange").textContent = this.formatBonus(item.equipment.attack_ranged);

            template.querySelector(".valDefStab").textContent = this.formatBonus(item.equipment.defence_stab);
            template.querySelector(".valDefSlash").textContent = this.formatBonus(item.equipment.defence_slash);
            template.querySelector(".valDefCrush").textContent = this.formatBonus(item.equipment.defence_crush);
            template.querySelector(".valDefMagic").textContent = this.formatBonus(item.equipment.defence_magic);
            template.querySelector(".valDefRange").textContent = this.formatBonus(item.equipment.defence_ranged);

            template.querySelector(".valStrBonus").textContent = this.formatBonus(item.equipment.melee_strength);
            template.querySelector(".valRangeStr").textContent = this.formatBonus(item.equipment.ranged_strength);
            template.querySelector(".valMagicDmg").textContent = this.formatBonus(item.equipment.magic_damage);
            template.querySelector(".valPrayer").textContent = this.formatBonus(item.equipment.prayer);
        } else {
            template.querySelector("#combat-sections").textContent = "";
        }

        // Equipable

        // Wiki Link
        const wikiLink = template.querySelector(".valWikiUrl");
        if (wikiLink && item.wiki_url) {
            wikiLink.href = item.wiki_url;
        }

        return template;
    }

    loadMore() {
        const nextBatch = this.data.slice(this.currentIndex, this.currentIndex + this.limit);
        nextBatch.forEach((item) => {
            const clone = this.template.content.cloneNode(true);
            this.populateCard(clone, item);
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

    formatUnderscoreString(str) {
        return str
            .split("_")
            .map((word) => this.capitalize(word))
            .join(" ");
    }

    getFormattedStances(stances) {
        return stances.map((stance) => this.capitalize(stance.combat_style)).join(", ");
    }

    formatBonus(value) {
        return value >= 0 ? `+${value}` : `${value}`;
    }
}
