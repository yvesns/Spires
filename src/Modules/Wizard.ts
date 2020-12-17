import {SignalClass} from "./SignalClass"
import {ItemID} from "./Item"
import {NPC} from '../../node_modules/@dcl/npc-utils/index'
import {Dialog} from '../../node_modules/@dcl/npc-utils/utils/types'
import utils from "../../node_modules/decentraland-ecs-utils/index"

var wizard
var g_game_context
var camera = Camera.instance

export class Wizard extends SignalClass{
    npc
    model_path = "Models/Wizard.glb"
    gave_player_arcane_orb = false
    game_context

    base_sound_name = "Wizard"
    sound_count = 10

    is_speaking = false

    explosion_sound_entity

    constructor(game_context){
        super()

        this.init_explosion_sound_entity()

        this.game_context = game_context
        g_game_context = game_context

        this.npc = new NPC(
            { position: new Vector3(15, 0.1, 10) }, 
            this.model_path, 
            () => {
                this.on_activate()
            },
            {
                onlyClickTrigger: true,
                coolDownDuration: 0.1,
                onWalkAway: () => {this.is_speaking = false}
            }
        )

        this.npc.getComponent(Transform).scale = new Vector3(0.5, 0.5, 0.5)

        wizard = this

        this.moveUp()

        engine.addSystem(this)
    }

    get_explosion_sound_entity(){
        return this.explosion_sound_entity
    }

    init_explosion_sound_entity(){
        this.explosion_sound_entity = new Entity()
        var clip = new AudioClip("Sounds/Explosion.wav")
        var source = new AudioSource(clip)
        var transform = new Transform()
        this.explosion_sound_entity.addComponent(source)
        this.explosion_sound_entity.addComponent(transform)
        engine.addEntity(this.explosion_sound_entity)
    }

    update(){
        var p = new Vector3(camera.position.x, 0, camera.position.z)
        this.npc.getComponent(Transform).lookAt(p)
    }

    moveUp(){
        var origin = this.getPosition()
        var destination = new Vector3(origin.x, 0.25 * Math.random(), origin.z)
        var time = 2
    
        var component = new utils.MoveTransformComponent(
          origin, 
          destination, 
          time,
          () => {this.moveDown()}
        )
    
        this.npc.addComponentOrReplace(component)
      }
    
      moveDown(){
        var origin = this.getPosition()
        var destination = new Vector3(origin.x, 0.1, origin.z)
        var time = 2
    
        var component = new utils.MoveTransformComponent(
          origin, 
          destination, 
          time,
          () => {this.moveUp()}
        )
    
        this.npc.addComponentOrReplace(component)
      }
    
      getPosition(){
        return this.npc.getComponent(Transform).position
      }

    on_activate(){
        if(this.game_context.is_game_running){
            return
        }

        wizard.play_random_sound()

        var player = this.game_context.get_player()
        var dialog = initial_dialog

        player.recover_hp(player.get_max_hp())
        
        if(player.has_item(ItemID.TELEPORTATION_RING)){
            dialog = default_dialog
        }

        this.npc.talk(dialog, 0)

        this.is_speaking = true
    }

    create_new_spires(){
        this.game_context.start_game()
    }

    play_random_sound(){
        var sound_number = Math.floor(Math.random() * this.sound_count) + 1;
        var path = "Sounds/" + this.base_sound_name + sound_number.toString() + ".wav"
        var clip = new AudioClip(path)
        var source = new AudioSource(clip)

        this.npc.addComponentOrReplace(source)

        source.playOnce()
    }
}

const initial_dialog: Dialog[] = [
    {
        text: "Greetings, adventurer.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "It is not often that these heights receives visitors.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "If you harvest arcane energy from this area, maybe we can trade.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "I can channel the power of the earth for a time using your life force and make the energy visible. Talk to me if you're interested.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "Take this teleportation ring as a token of good faith, it may help you on your tasks.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "Beware with your falls, though. The channeling is broken if you can't stand on your feet anymore.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "In any case, I will heal you between channelings. Tell me when you are ready.",
        isEndOfDialog: true,
        triggeredByNext: () => {
            var entity = new Entity()
            var clip = new AudioClip("Sounds/RingPickUp.wav")
            var source = new AudioSource(clip)
            var transform = new Transform()

            entity.addComponent(transform)
            transform.position = camera.position
            entity.addComponent(source)
            engine.addEntity(entity)
            source.playOnce()

            var player = g_game_context.get_player()
            player.add_item(ItemID.TELEPORTATION_RING)
        }
    },
]

const default_dialog: Dialog[] = [
    {
        text: "Yes?",
        isQuestion: true,
        buttons: [
            {
                label: "Channeling",
                goToDialog: "end",
                triggeredActions:  () => {
                    wizard.get_explosion_sound_entity().getComponent(Transform).position = camera.position
                    wizard.get_explosion_sound_entity().getComponent(AudioSource).playOnce()
                    wizard.create_new_spires()
                }
            },
            {
                label: "Help me",
                goToDialog: "help",
                triggeredActions:  () => {
                    wizard.play_random_sound()
                }
            }
        ]
    },
    {
        name: "end",
        text: "It is done.",
        triggeredByNext:  () => {
            wizard.play_random_sound()
            wizard.is_speaking = false
        },
        isEndOfDialog: true,
    },
    {
        name: "help",
        text: "I can channel arcane energy into this area for a short period of time using your life as a medium.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "I'm willing to trade several of my potions for arcane orbs. If you collect a lot of them, I may have an interesting deal.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "I can heal you, but be careful when teleporting around. The channeling is broken if your vital energy becomes too weak.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "If you need help activating the ring, there is a big engraving of a letter 'E' on it. Maybe you can figure out what that means.",
        triggeredByNext: () => {
            wizard.play_random_sound()
        }
    },
    {
        text: "Besides that there is not much else I can help you with. Enjoy the scenery.",
        isEndOfDialog: true,
    },
]