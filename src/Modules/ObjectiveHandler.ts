import {SignalClass} from "./SignalClass"
import {ItemID, ItemInfo} from "./Item"
import * as misc from "./Misc"

const camera = Camera.instance

class Target extends SignalClass{
    static TARGET_DESTROYED_SIGNAL = 0

    static clip = new AudioClip("Sounds/EnergyPickUp3.wav")

    model_path = "Models/Target.glb"
    entity
    on_destroyed_callback
    destroyed = false

    sound_entity

    constructor(position){
        super()
        this.init_entity(position)
        this.init_sound_entity()
        this.init_signals()
    }

    init_sound_entity(){
        var source = new AudioSource(Target.clip)
  
        this.sound_entity = new Entity()
        this.sound_entity.addComponent(source)
        this.sound_entity.addComponent(new Transform())
        this.sound_entity.getComponent(Transform).rotation = Quaternion.Euler(90, 0, 0)
  
        engine.addEntity(this.sound_entity)
    }

    init_entity(position){
        this.entity = misc.createGTLFShape(this.model_path, position)

        this.entity.addComponent(
            new OnPointerDown(
                (e) => {this.destroy()},
                {
                button: ActionButton.POINTER,
                showFeedback: false,
                distance: 64,
                }
            )
        )
    }

    init_signals(){
        this.signal_callbacks[Target.TARGET_DESTROYED_SIGNAL] = []
    }

    get_entity(){
        return this.entity
    }

    destroy_entity(){
        if(this.destroyed){
            return
        }

        engine.removeEntity(this.entity)
    }

    destroy(){
        this.sound_entity.getComponent(Transform).position = camera.position
        this.sound_entity.getComponent(AudioSource).playOnce()
        this.destroy_entity()
        this.destroyed = true
        this.emit_signal(Target.TARGET_DESTROYED_SIGNAL)
    }
}

export class ObjetiveHandler extends SignalClass{
    static ALL_TARGETS_DESTROYED_SIGNAL = 0
    static TARGET_DESTROYED_SIGNAL = 1
    static TARGET_DESTROYED_COUNT_CHANGED = 2

    terrain_data
    targets
    max_targets = 20
    targets_destroyed = 0
    game_context

    constructor(game_context){
        super()
        this.game_context = game_context
        this.init_signals()
    }

    get_targets_destroyed(){
        return this.targets_destroyed
    }

    init_signals(){
        this.signal_callbacks[ObjetiveHandler.ALL_TARGETS_DESTROYED_SIGNAL] = []
        this.signal_callbacks[ObjetiveHandler.TARGET_DESTROYED_SIGNAL] = []
        this.signal_callbacks[ObjetiveHandler.TARGET_DESTROYED_COUNT_CHANGED] = []
    }

    generate_targets(terrain_data){
        this.terrain_data = terrain_data
        this.targets = []

        var terrain_models = terrain_data[1]
        var transform
        var scale
        var position
        var new_position
        var target

        this.max_targets = (terrain_models.length / 2) * (terrain_models[0].length / 2)

        for(var i = 0; i < terrain_models.length; i++){
            for(var j = 0; j < terrain_models[i].length; j++){
                if (Math.random() <= 0.9){continue}

                transform = terrain_models[i][j].getComponent(Transform)
                position = transform.position
                scale = transform.scale
                new_position = new Vector3(position.x, position.y + (6 * scale.y), position.z)
                target = new Target(new_position)
                target.connect(Target.TARGET_DESTROYED_SIGNAL, this, "on_target_destroyed")
                this.targets.push(target)

                if(this.targets.length >= this.max_targets){
                    break
                }
            }

            if(this.targets.length >= this.max_targets){
                break
            }
        }

        return this.targets
    }

    end_game(){
        this.targets_destroyed = 0

        this.targets.forEach(element => {
            element.destroy_entity()
        });
    }

    increment_target_destroyed_count(){
        var increment = 1
        var player = this.game_context.get_player()

        if(player.has_item(ItemID.DOUBLE_REWARD_POTION)){
            if(Math.random() < ItemInfo[ItemID.DOUBLE_REWARD_POTION]["chance"]){
                increment = 2
            }
        }

        this.targets_destroyed += increment
        this.emit_signal(ObjetiveHandler.TARGET_DESTROYED_COUNT_CHANGED, this.targets_destroyed)
    }

    on_target_destroyed(){
        this.increment_target_destroyed_count()

        if(this.targets_destroyed >= this.max_targets){
            this.emit_signal(ObjetiveHandler.ALL_TARGETS_DESTROYED_SIGNAL)
        }

        this.emit_signal(ObjetiveHandler.TARGET_DESTROYED_SIGNAL)
    }
}