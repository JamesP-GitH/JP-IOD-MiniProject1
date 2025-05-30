export default class ItemParser {
    constructor(data) {
        this.data = data;
    }

    getAllItems() {
        return Object.values(this.data);
    }

    getEquipableItems() {
        return Object.values(this.data).filter((item) => item.equipable_by_player);
    }

    getEquipableWeapons() {
        return Object.values(this.data).filter((item) => item.equipable_by_player && item.equipable_weapon);
    }

    getItemsBySlot(slotName) {
        return Object.values(this.data).filter((item) => item.equipable_by_player && item.equipment && item.equipment.slot === slotName);
    }

    getItemById(itemId) {
        return this.data[itemId] || null;
    }

    searchItemsByName(searchString) {
        const lowerSearch = searchString.toLowerCase().trim();
        return Object.values(this.data).filter((item) => item.name.toLowerCase().includes(lowerSearch));
    }
}
