export default class MonsterParser {
    constructor(data) {
        this.data = data;
    }

    narrowMonsterList() {
        const grouped = {};
        const monsters = Object.values(this.data);

        monsters.forEach((monster) => {
            let { wiki_name, combat_level, id } = monster;
            if (!wiki_name || combat_level == null) return;

            // Normalize the wiki name
            const baseName = wiki_name.replace(/\s\(\d+\)$/, "");

            if (!wiki_name || combat_level === undefined) {
                console.warn(`Skipping monster ${monster.name || id}: wiki_name=${wiki_name}, level=${combat_level}`);
                return;
            }
            if (!grouped[baseName]) {
                grouped[baseName] = {
                    wiki_name: baseName,
                    monsterData: null,
                };
            }

            const stats = {
                hitpoints: monster.hitpoints,
                attack_bonus: monster.attack_bonus,
                attack_level: monster.attack_level,
                attack_magic: monster.attack_magic,
                attack_ranged: monster.attack_ranged,
                attack_speed: monster.attack_speed,
                attack_type: monster.attack_type || [],
                attributes: monster.attributes || [],
                defence_crush: monster.defence_crush,
                defence_level: monster.defence_level,
                defence_magic: monster.defence_magic,
                defence_ranged: monster.defence_ranged,
                defence_slash: monster.defence_slash,
                defence_stab: monster.defence_stab,
                magic_bonus: monster.magic_bonus,
                magic_level: monster.magic_level,
                ranged_bonus: monster.ranged_bonus,
                ranged_level: monster.ranged_level,
                strength_bonus: monster.strength_bonus,
                strength_level: monster.strength_level,
            };

            const slayerInfo = {
                slayer_level: monster.slayer_level,
                slayer_masters: monster.slayer_masters || [],
                slayer_monster: monster.slayer_monster,
                slayer_xp: monster.slayer_xp,
            };

            const commonInfo = {
                examine: monster.examine,
                immune_poison: monster.immune_poison,
                immune_venom: monster.immune_venom,
                poisonous: monster.poisonous,
                size: monster.size,
            };

            const normalizedWikiUrl = monster.wiki_url ? monster.wiki_url.split("#")[0] : "";

            const metaInfo = {
                members: monster.members,
                wiki_url: monster.normalizedWikiUrl,
            };

            const newMonsterData = {
                name,
                combat_level,
                ids: [id],
                stats,
                slayerInfo,
                commonInfo: {
                    ...commonInfo,
                    examine: monster.examine ? [monster.examine] : [],
                },
                metaInfo,
            };

            const group = grouped[baseName];

            if (group.monsterData) {
                const existing = group.monsterData;

                const differences = [];

                if (existing.name !== name || existing.combat_level !== combat_level) {
                    differences.push(`name/combat_level: "${existing.name}" (${existing.combat_level}) vs "${name}" (${combat_level})`);
                }

                differences.push(...getDifferences(existing.stats, stats, "stats"));
                differences.push(...getDifferences(existing.slayerInfo, slayerInfo, "slayerInfo"));
                differences.push(...getDifferences(existing.commonInfo, commonInfo, "commonInfo"));
                differences.push(...getDifferences(existing.metaInfo, metaInfo, "metaInfo"));

                if (differences.length > 0) {
                    console.group(`⚠️ Inconsistent data for "${baseName}" (ID: ${id}):`);
                    differences.forEach((diff) => console.log(` - ${diff}`));
                    console.groupEnd();
                    return; // skip this monster
                }

                existing.ids.push(id);

                if (monster.examine) {
                    if (!Array.isArray(existing.commonInfo.examine)) {
                        existing.commonInfo.examine = [existing.commonInfo.examine];
                    }
                    if (!existing.commonInfo.examine.includes(monster.examine)) {
                        existing.commonInfo.examine.push(monster.examine);
                    }
                }
            } else {
                // When creating new monsterData, ensure examine is an array
                group.monsterData = {
                    ...newMonsterData,
                    commonInfo: {
                        ...commonInfo,
                        examine: monster.examine ? [monster.examine] : [],
                    },
                };
            }
        });

        return Object.values(grouped);
    }
}
function getDifferences(obj1, obj2, prefix = "") {
    const diffs = [];

    for (const key in obj1) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (!(key in obj2)) {
            diffs.push(`Missing in second: ${path}`);
        } else if (typeof obj1[key] === "object" && obj1[key] !== null) {
            if (Array.isArray(obj1[key]) || Array.isArray(obj2[key])) {
                const arr1 = Array.isArray(obj1[key]) ? obj1[key] : [obj1[key]];
                const arr2 = Array.isArray(obj2[key]) ? obj2[key] : [obj2[key]];

                const sorted1 = JSON.stringify([...arr1].sort());
                const sorted2 = JSON.stringify([...arr2].sort());

                if (sorted1 !== sorted2) {
                    diffs.push(`Difference in ${path}: [${sorted1}] vs [${sorted2}]`);
                }
            } else {
                diffs.push(...getDifferences(obj1[key], obj2[key], path));
            }
        } else if (obj1[key] !== obj2[key]) {
            diffs.push(`Difference in ${path}: ${obj1[key]} vs ${obj2[key]}`);
        }
    }

    return diffs;
}
