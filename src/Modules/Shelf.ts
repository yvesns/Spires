import * as misc from "./Misc"
import {Potion} from "./Potion"
import {ItemID} from "./Item"

export class Shelf{
    entity
    potions = []

    potion_offsets = [
        new Vector3(0, 2.2, 0.3),
        new Vector3(0, 2.2, -0.3),
        new Vector3(0, 1.6, 0.3),
        new Vector3(0, 1.6, -0.3),
        new Vector3(0, 1, 0.3),
        new Vector3(0, 1, -0.3),
        new Vector3(0, 0.35, 0.3),
        new Vector3(0, 0.35, -0.3)
    ]

    constructor(position, game_context){
        this.entity = misc.createGTLFShape("Models/RockShelf.glb", position)
        this.entity.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)
        this.entity.getComponent(Transform).scale = new Vector3(0.8, 0.8, 0.8)

        var base_position = this.entity.getComponent(Transform).position

        this.potions.push(new Potion(
            ItemID.HP_UPGRADE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[0]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.HP_REGEN_UPGRADE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[1]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.MAX_TIME_UPGRADE, 
            misc.sum_vec3(base_position, this.potion_offsets[2]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.MP_REGEN_UPGRADE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[3]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.MP_UPGRADE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[4]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.NO_FALL_DAMAGE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[5]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.DOUBLE_REWARD_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[6]),
            game_context)
        )

        this.potions.push(new Potion(
            ItemID.MP_REGEN_UPGRADE_POTION, 
            misc.sum_vec3(base_position, this.potion_offsets[7]),
            game_context)
        )
    }

    get_potions(){
        return this.potions
    }
}