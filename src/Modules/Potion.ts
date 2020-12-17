import * as misc from "./Misc"
import {ItemInfo} from "./Item"
import {SignalClass} from "./SignalClass"

export class Potion extends SignalClass{
    static BOUGHT = 0

    game_context
    entity
    id
    info
    apply_effect

    potion_effects = []

    constructor(item_id, position, game_context){
        super()

        this.init_signals()

        this.game_context = game_context
        this.id = item_id
        this.info = ItemInfo[item_id]
        this.entity = misc.createGTLFShape("Models/Potion.glb", position)
        this.entity.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)
        this.entity.getComponent(Transform).scale = new Vector3(0.1, 0.1, 0.1)

        var description = this.info["description"]
        description += "\n Price: " + this.info["price"].toString() + " orbs"

        this.entity.addComponent(
            new OnPointerDown(
                (e) => {
                    this.on_pointer_down(e)
                },
                {
                    button: ActionButton.POINTER,
                    showFeedback: true,
                    hoverText: description
                }
            )
        )
    }

    init_signals(){
        this.signal_callbacks[Potion.BOUGHT] = []
      }

    on_pointer_down(e){
        var player = this.game_context.get_player()
        var price = this.info["price"]

        if(player.get_orbs() < price){
            return
        }

        player.remove_orbs(price)

        var clip = new AudioClip("Sounds/PickingBottle.wav")
        var source = new AudioSource(clip)
        this.entity.addComponent(source)
        source.playOnce()

        this.info["effect_function"](this.game_context)

        this.emit_signal(Potion.BOUGHT)

        engine.removeEntity(this.entity)
    }
}