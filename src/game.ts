import {TerrainGenerator} from "./modules/TerrainGenerator"
import {ObjetiveHandler} from "./modules/ObjectiveHandler"
import {GUIHandler} from "./Modules/GUIHandler"
import {Wizard} from "./Modules/Wizard"
import {Timer} from "./Modules/Timer"
import {Player} from "./Modules/Player"
import {Ground} from "./Modules/Ground"
import {Shelf} from "./Modules/Shelf"
import {TrophySystem} from "./Modules/TrophySystem"
import * as misc from "./Modules/Misc"

class GameContext{
  player
  ground = new Ground()
  stone_shelter
  stone_shelf
  terrain_generator = new TerrainGenerator()
  terrain_data
  objective_handler
  targets = null
  gui_handler
  wizard
  game_timer
  is_game_running = false
  player_death_sound_entity
  trophy_system
  mana_well
  bucket
  bell
  bell_sound = null
  stone_hand
  thumb

  constructor(){
    this.init_player_death_sound_entity()
    this.init_bell()

    this.player = new Player(this)
    this.objective_handler = new ObjetiveHandler(this)

    this.stone_shelter = misc.createGTLFShape("Models/RockShelter.glb", new Vector3(20, 0.1, 8))
    this.stone_shelter.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)
    this.stone_shelter.getComponent(Transform).scale = new Vector3(0.8, 0.8, 0.8)

    this.stone_shelf = new Shelf(new Vector3(17, 0.1, 8), this)

    this.mana_well = misc.createGTLFShape("Models/ManaWell.glb", new Vector3(8, 0.1, 8))
    this.mana_well.getComponent(Transform).scale = new Vector3(0.1, 0.1, 0.1)
    this.mana_well.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)

    this.stone_hand = misc.createGTLFShape("Models/BrokenStoneHand.glb", new Vector3(-2, 0.0, 15))
    this.stone_hand.getComponent(Transform).scale = new Vector3(20, 20, 20)
    this.stone_hand.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)

    this.thumb = misc.createGTLFShape("Models/Thumb.glb", new Vector3(15, -2, 15))
    this.thumb.getComponent(Transform).scale = new Vector3(20, 20, 20)
    this.thumb.getComponent(Transform).rotation = Quaternion.Euler(90, -90, 30)

    this.bucket = misc.createGTLFShape("Models/Bucket.glb", new Vector3(8, 0.1, 6.5))
    this.bucket.getComponent(Transform).scale = new Vector3(0.2, 0.2, 0.2)

    this.game_timer = new Timer()
    this.terrain_generator.set_ground_model_offset(new Vector3(10, -10, 10))
    this.terrain_generator.set_terrain_offset(new Vector3(25, 0, 25))
    this.terrain_data = this.terrain_generator.generate_simple_terrain(17, 17, misc.pillar_creator)
    this.gui_handler = new GUIHandler(this)
    this.wizard = new Wizard(this)

    this.trophy_system = new TrophySystem(new Vector3(8, 0.2, 20), this)

    this.game_timer.connect(
      Timer.TIMEOUT_SIGNAL,
      this,
      "on_game_timer_timeout"
    )

    this.player.connect(
      Player.DIED,
      this,
      "on_player_death"
    )
  }

  init_bell(){
    this.bell = misc.createGTLFShape("Models/Bell.glb", new Vector3(17, 1, 6.5))
    this.bell.getComponent(Transform).scale = new Vector3(0.2, 0.2, 0.2)
    this.bell.getComponent(Transform).rotation = Quaternion.Euler(0, -90, 0)

    this.bell_sound = new Entity()
    var transform = new Transform()
    transform.position = this.bell.getComponent(Transform).position
    var clip = new AudioClip("Sounds/Bell.mp3")
    var source = new AudioSource(clip)
    this.bell_sound.addComponent(transform)
    this.bell_sound.addComponent(source)

    engine.addEntity(this.bell_sound)

    this.bell.addComponent(
      new OnPointerDown(
          (e) => {
            this.bell_sound.getComponent(AudioSource).playOnce()
          },
          {
              button: ActionButton.POINTER,
              distance: 4
          }
      )
    )
  }

  init_player_death_sound_entity(){
    this.player_death_sound_entity = new Entity()
    var transform = new Transform()
    var clip = new AudioClip("Sounds/SmashingGlass.wav")
    var source = new AudioSource(clip)

    this.player_death_sound_entity.addComponent(transform)
    this.player_death_sound_entity.addComponent(source)

    engine.addEntity(this.player_death_sound_entity)
  }

  get_shelf(){
    return this.stone_shelf
  }

  get_wizard(){
    return this.wizard
  }

  get_player(){
    return this.player
  }

  get_objective_handler(){
    return this.objective_handler
  }

  get_game_timer(){
    return this.game_timer;
  }

  clear_map(){
    var rows = this.terrain_data[1]

    rows.forEach(columns => {
      columns.forEach(pillar => {
        engine.removeEntity(pillar)
      });
    });

    if(this.targets === null){
      return
    }

    this.objective_handler.end_game()
  }

  start_game(){
    this.clear_map()

    this.terrain_data = this.terrain_generator.generate_simple_terrain(17, 17, misc.pillar_creator)
    this.targets = this.objective_handler.generate_targets(this.terrain_data)

    this.game_timer.start()
    this.gui_handler.show_main_game_gui()
    this.is_game_running = true
  }

  end_game(){
    this.player.add_orbs(this.objective_handler.get_targets_destroyed())
    this.objective_handler.end_game()
    this.gui_handler.hide_main_game_gui()
    this.game_timer.stop()
    this.is_game_running = false
  }

  on_game_timer_timeout(){
    this.end_game()
  }

  on_player_death(){
    if(!this.is_game_running){
      return
    }

    this.player_death_sound_entity.getComponent(Transform).position = Camera.instance.position
    this.player_death_sound_entity.getComponent(AudioSource).playOnce()

    this.objective_handler.end_game()
    this.gui_handler.hide_main_game_gui()
    this.game_timer.stop()
    this.is_game_running = false
  }
}

const input = Input.instance
const game_context = new GameContext()

function teleport_handler(event){
  game_context.get_player().teleport(event)
}

input.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, true, teleport_handler)