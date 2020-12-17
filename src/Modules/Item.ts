export enum ItemID {
    TELEPORTATION_RING,
    HP_UPGRADE_POTION,
    HP_REGEN_UPGRADE_POTION,
    MP_UPGRADE_POTION,
    MP_REGEN_UPGRADE_POTION,
    NO_FALL_DAMAGE_POTION,
    DOUBLE_REWARD_POTION,
    MAX_TIME_UPGRADE
}

export var ItemInfo = []

ItemInfo[ItemID.HP_UPGRADE_POTION] = {
    "description": "Increases maximum hp by 50%",
    "price": 30,
    "effect_function": function (game_context) {
        var player = game_context.get_player()

        player.add_item(ItemID.HP_UPGRADE_POTION)
        player.set_max_hp(player.get_max_hp() * 1.5)
    }
}

ItemInfo[ItemID.HP_REGEN_UPGRADE_POTION] = {
    "description": "Gives a permanent hp regeneration effect",
    "price": 50,
    "effect_function": function (game_context) {
        var player = game_context.get_player()
        player.add_item(ItemID.HP_REGEN_UPGRADE_POTION)
    }
}

ItemInfo[ItemID.MP_UPGRADE_POTION] = {
    "description": "Increases maximum mp by 50%",
    "price": 15,
    "effect_function": function (game_context) {
        var player = game_context.get_player()

        player.add_item(ItemID.MP_UPGRADE_POTION)
        player.set_max_mp(player.get_max_mp() * 1.5)
    }
}

ItemInfo[ItemID.MP_REGEN_UPGRADE_POTION] = {
    "description": "Doubles mp regeneration",
    "price": 20,
    "effect_function": function (game_context) {
        var player = game_context.get_player()

        player.add_item(ItemID.MP_REGEN_UPGRADE_POTION)
        player.set_mp_regen(player.get_mp_regen() * 2)
    }
}

ItemInfo[ItemID.NO_FALL_DAMAGE_POTION] = {
    "description": "Fall damage immunity",
    "price": 100,
    "effect_function": function (game_context) {
        var player = game_context.get_player()
        player.add_item(ItemID.NO_FALL_DAMAGE_POTION)
    }
}

ItemInfo[ItemID.DOUBLE_REWARD_POTION] = {
    "description": "Arcane orbs have a 30% chance to count as 2 orbs instead of 1",
    "price": 30,
    "chance": 0.3,
    "effect_function": function (game_context) {
        var player = game_context.get_player()
        player.add_item(ItemID.DOUBLE_REWARD_POTION)
    }
}

ItemInfo[ItemID.MAX_TIME_UPGRADE] = {
    "description": "Increases maximum time by 30%",
    "price": 15,
    "effect_function": function (game_context) {
        var player = game_context.get_player()
        player.add_item(ItemID.MAX_TIME_UPGRADE)

        var timer = game_context.get_game_timer()
        timer.set_max_time(timer.get_max_time() * 1.3)
    }
}