export default class PrayerParser {
    constructor(data) {
        this.data = data;
    }

    returnPrayers() {
        return Object.values(this.data);
    }
}
