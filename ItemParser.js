export default class ItemParser {
    constructor(data) {
        this.data = data;
    }

    getEquipableItems() {
        return Object.fromEntries(Object.entries(this.data).filter(([itemId, itemData]) => itemData.equipable_by_player));
    }

    getEquipableWeapons() {
        return Object.fromEntries(
            Object.entries(this.data).filter(([itemId, itemData]) => itemData.equipable_by_player && itemData.equipable_weapon)
        );
    }

    getItemsBySlot(slotName) {
        return Object.fromEntries(
            Object.entries(this.data).filter(
                ([itemId, itemData]) => itemData.equipable_by_player && itemData.equipment && itemData.equipment.slot === slotName
            )
        );
    }

    getItemById(itemId) {
        return this.data[itemId] || null;
    }

    searchItemsByName(searchString) {
        const lowerSearch = searchString.toLowerCase().trim();
        return Object.fromEntries(
            Object.entries(this.data).filter(([itemId, itemData]) => itemData.name.toLowerCase().includes(lowerSearch))
        );
    }
}
