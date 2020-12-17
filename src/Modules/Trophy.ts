import * as misc from "./Misc"
import {Potion} from "./Potion"
import {Player} from "./Player"
import {SignalClass} from "./SignalClass"

export class Trophy extends SignalClass{
    static COLLECTED = 0

    entity
    description
    collected = false

    constructor(){
        super()

        this.init_signals()

        this.entity = misc.createGTLFShape("Models/Trophy.glb", new Vector3(10, 0, 10))
        this.entity.getComponent(Transform).scale = new Vector3(0.05, 0.05, 0.05)
        this.hide()
    }

    show(){
        this.entity.getComponent(GLTFShape).visible = true
    }

    hide(){
        this.entity.getComponent(GLTFShape).visible = false
    }

    get_entity(){
        return this.entity
    }

    init_signals(){
        this.signal_callbacks[Trophy.COLLECTED] = []
    }

    get_description(){
        return this.description
    }
}

export class AllPotionsTrophy extends Trophy {
    description = "All potions bought"
    potion_count = 0
    max_potions = 8

    constructor(game_context){
        super()

        var shelf = game_context.get_shelf()
        var potions = shelf.get_potions()

        for(var i = 0; i < potions.length; i++){
            potions[i].connect(
                Potion.BOUGHT,
                this,
                "on_potion_bought"
            )
        }
    }

    on_potion_bought(){
        if(this.collected){
            return
        }

        this.potion_count += 1

        if(this.potion_count >= this.max_potions){
            this.collected = true
            this.show()
            this.emit_signal(Trophy.COLLECTED)
        }
    }
}

export class TeleportCountTrophy extends Trophy{
    max_teleport_count = 100
    teleport_count = 0
    description = "Teleported " + this.max_teleport_count.toString() + " times"

    constructor(game_context){
        super()

        game_context.get_player().connect(
            Player.TELEPORTED,
            this,
            "on_player_teleported"
        )
    }

    set_max_teleport_count(count){
        this.max_teleport_count = count
        this.description = "Teleported " + this.max_teleport_count.toString() + " times"
    }

    on_player_teleported(){
        if(this.collected){
            return
        }

        this.teleport_count += 1

        if(this.teleport_count >= this.max_teleport_count){
            this.collected = true
            this.show()
            this.emit_signal(Trophy.COLLECTED)
        }
    }
}

export class OrbsCollectedTrophy extends Trophy{
    max_orbs = 100
    orb_count = 0
    description = "Collected " + this.max_orbs.toString() + " orbs"

    constructor(game_context){
        super()

        game_context.get_player().connect(
            Player.ORB_COUNT_CHANGED,
            this,
            "on_orb_count_changed"
        )
    }

    set_max_max_orbs(count){
        this.max_orbs = count
        this.description = "Collected " + this.max_orbs.toString() + " orbs"
    }

    on_orb_count_changed(count){
        if(count > this.orb_count){
            this.orb_count = count
        }

        if(this.collected){
            return
        }

        if(this.orb_count >= this.max_orbs){
            this.collected = true
            this.show()
            this.emit_signal(Trophy.COLLECTED)
        }
    }
}

export class AllTrophiesCollected extends Trophy{
    description = "All trophies collected"
    max_trophies
    trophy_count = 0

    constructor(trophies){
        super()

        this.max_trophies = trophies.length

        for(var i = 0; i < trophies.length; i++){
            trophies[i].connect(
                Trophy.COLLECTED,
                this,
                "on_trophy_collected"
            )
        }
    }

    on_trophy_collected(){
        if(this.collected){
            return
        }

        this.trophy_count += 1

        if(this.trophy_count >= this.max_trophies){
            this.collected = true
            this.show()
            this.emit_signal(Trophy.COLLECTED)
        }
    }
}

export class TrophyPedestal{
    entity

    constructor(position, trophy){
        this.entity = misc.createGTLFShape("Models/TrophyPedestal.glb", position)
        this.entity.getComponent(Transform).scale = new Vector3(0.1, 0.1, 0.1)
        this.entity.addComponent(
            new OnPointerDown(
                (e) => {},
                {
                    button: ActionButton.POINTER,
                    showFeedback: true,
                    hoverText: trophy.get_description()
                }
            )
        )

        var p = new Vector3(position.x, position.y + 1.17, position.z)
        trophy.get_entity().getComponent(Transform).position = p
    }
}