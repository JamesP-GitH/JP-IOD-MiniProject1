export default class PrayerCardRenderer {
    constructor({ cardTemplate, cardContainer, data }) {
        this.template = document.querySelector(cardTemplate);
        if (!this.template) {
            console.error(`Template with ID "${cardTemplate}" not found.`);
        }
        this.container = document.querySelector(cardContainer);
        this.data = data;
    }

    populateCard(template, prayerDataObj) {
        const prayer = prayerDataObj;

        template.querySelector(".valName").textContent = prayer.name;
        template.querySelector(".valReq").textContent =
            "Level Requirements: " +
            Object.entries(prayer.requirements || {})
                .map(([skill, level]) => `${this.capitalize(skill)} ${level}`)
                .join(", ");

        const iconElement = template.querySelector(".valIcon");
        if (prayer.id !== undefined) {
            iconElement.src = `./prayers-icons/${prayer.id}.png`;
        }

        template.querySelector(".valDesc").textContent = prayer.description;
        template.querySelector(".valMembers").textContent = prayer.members ? "Yes" : "No";
        template.querySelector(".valDrain").textContent = `${prayer.drain_per_minute} pts / min`;

        if (Object.keys(prayer.bonuses).length >= 1) {
            const prayerContainer = template.querySelector("#stat-bonus");
            const statBonusHtml = Object.entries(prayer.bonuses)
                .map(([stat, value]) => {
                    const statName = this.formatUnderscoreString(stat);
                    return `<div class="col-md-4 col-sm-6 fw-semibold border-end">${statName}: ${value}%</div>`;
                })
                .join("");

            prayerContainer.innerHTML = statBonusHtml;
        } else {
            template.querySelector("#statContainer").textContent = "";
        }
    }

    loadMore() {
        this.data.forEach((prayerData) => {
            const clone = this.template.content.cloneNode(true);
            this.populateCard(clone, prayerData);
            this.container.appendChild(clone);
        });
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatUnderscoreString(str) {
        return str
            .split("_")
            .map((word) => this.capitalize(word))
            .join(" ");
    }
}
