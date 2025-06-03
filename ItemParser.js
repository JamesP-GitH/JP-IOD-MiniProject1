export default class ItemParser {
    constructor(data) {
        this.data = data;
    }

    groupByWikiName() {
        const validItems = Object.values(this.data).filter((item) => !item.placeholder && !item.duplicate);

        const groups = {};
        for (const item of validItems) {
            const key = item.wiki_name || "unknown";
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        }

        const mergedItems = Object.values(groups).map((group) => {
            const base = {};
            const fieldValues = {};

            base.ids = group.map((item) => item.id).filter((id) => id !== undefined);

            for (const item of group) {
                for (const key in item) {
                    if (key === "id" || key === "ids" || key === "placeholder" || key === "duplicate") continue;

                    if (!fieldValues[key]) fieldValues[key] = new Set();

                    if (item[key] !== null && item[key] !== undefined && item[key] !== "") {
                        fieldValues[key].add(item[key]);
                    }

                    if (base[key] === undefined || base[key] === null || base[key] === "" || base[key] === false) {
                        base[key] = item[key];
                    }
                }
            }

            const conflicts = {};
            for (const key in fieldValues) {
                if (fieldValues[key].size > 1) {
                    conflicts[key] = Array.from(fieldValues[key]);
                }
            }

            if (Object.keys(conflicts).length > 0) {
                base.conflicts = conflicts;
            }

            return base;
        });

        return mergedItems;
    }
}
