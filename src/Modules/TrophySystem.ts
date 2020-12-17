import * as t from "./Trophy"
import * as m from "./Misc"

export class TrophySystem {
    trophies = []
    pedestals = []
    pedestal_offsets = [
        new Vector3(-4, 0, 0),
        new Vector3(-2, 0, 0),
        new Vector3(0, 0, 0),
        new Vector3(2, 0, 0)
    ]

    constructor(position, game_context){
        this.trophies.push(new t.AllPotionsTrophy(game_context))
        this.trophies.push(new t.OrbsCollectedTrophy(game_context))
        this.trophies.push(new t.TeleportCountTrophy(game_context))
        this.trophies.push(new t.AllTrophiesCollected(this.trophies))

        for(var i = 0; i < this.trophies.length; i++){
            this.pedestals.push(new t.TrophyPedestal(
                m.sum_vec3(position, this.pedestal_offsets[i]),
                this.trophies[i]
            ))
        }
    }
}