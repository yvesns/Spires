import {SignalClass} from "./SignalClass"
import {movePlayerTo} from '@decentraland/RestrictedActions'
import {ItemID} from "./Item"

const camera = Camera.instance

export class Player extends SignalClass{
    static HP_CHANGED = 0
    static MP_CHANGED = 1
    static MAX_HP_CHANGED = 2
    static MAX_MP_CHANGED = 3
    static ITEM_ADDED = 4
    static ORB_COUNT_CHANGED = 5
    static DIED = 6
    static TELEPORTED = 7
  
    max_hp = 100
    hp = 100
    max_mp = 100
    mp = 100
    hp_recovery_per_second = 10
    mana_recovery_per_second = 10
    inventory = []
    orbs = 0

    last_position
    last_y
    fall_height = 0
    fall_damage_height_threshold = 12
    base_fall_damage = 10

    teleport_distance = 50
    teleport_mana_cost = 30
    teleport_sound_entity

    footsteps_sound_entity
    footsteps_sound_wait_time = 0.25
    footsteps_sound_current_time = 0

    fall_impact_sound_entity
    fall_damage_sound_entity

    game_context
  
    constructor(game_context){
      super()

      this.game_context = game_context
      this.init_signals()
      this.footsteps_sound_entity = this.init_sound_entity("Sounds/Footsteps.mp3")
      this.teleport_sound_entity = this.init_sound_entity("Sounds/Teleport.wav")
      this.fall_impact_sound_entity = this.init_sound_entity("Sounds/FallImpact.mp3")
      this.fall_damage_sound_entity = this.init_sound_entity("Sounds/KidOof.wav")
      this.last_position = new Vector3(camera.position.x, camera.position.y, camera.position.z)
      this.last_y = camera.position.y

      engine.addSystem(this)
    }

    update(delta){
      this.regenerate_hp(delta)
      this.recover_mana(delta)
      this.check_fall_damage(delta)
      this.emit_footsteps_sound(delta)
    }

    init_sound_entity(clip_path){
      var clip = new AudioClip(clip_path)
      var source = new AudioSource(clip)

      var entity = new Entity()
      entity.addComponent(source)
      entity.addComponent(new Transform())

      engine.addEntity(entity)

      return entity
    }

    emit_footsteps_sound(delta){
      this.footsteps_sound_entity.getComponent(Transform).position = camera.position

      this.footsteps_sound_current_time += delta

      if(this.footsteps_sound_current_time < this.footsteps_sound_wait_time){
        return
      }

      this.footsteps_sound_current_time = 0

      if(this.last_position.y.toFixed(4) != camera.position.y.toFixed(4)){
        this.last_position = new Vector3(camera.position.x, camera.position.y, camera.position.z)
        this.footsteps_sound_entity.getComponent(AudioSource).playing = false
        return
      }

      if(this.last_position.x.toFixed(4) == camera.position.x.toFixed(4) && 
         this.last_position.z.toFixed(4) == camera.position.z.toFixed(4)){
        this.last_position = new Vector3(camera.position.x, camera.position.y, camera.position.z)
        this.footsteps_sound_entity.getComponent(AudioSource).playing = false
        return
      }

      this.last_position = new Vector3(camera.position.x, camera.position.y, camera.position.z)

      this.footsteps_sound_entity.getComponent(AudioSource).loop = true
      this.footsteps_sound_entity.getComponent(AudioSource).playing = true
    }

    check_fall_damage(delta){
        if(camera.position.y.toFixed(2) == this.last_y.toFixed(2)){
            this.take_fall_damage()
            this.last_y = camera.position.y
            return
        }

        if(this.last_y.toFixed(2) > camera.position.y.toFixed(2)){
          this.fall_height += this.last_y - camera.position.y
        }

        this.last_y = camera.position.y
    }

    take_fall_damage(){
        if(this.fall_height < this.fall_damage_height_threshold){
            this.fall_height = 0
            return
        }

        this.fall_impact_sound_entity.getComponent(Transform).rotation = camera.rotation
        this.fall_impact_sound_entity.getComponent(Transform).position = camera.position
        this.fall_impact_sound_entity.getComponent(AudioSource).playOnce()

        if(this.has_item(ItemID.NO_FALL_DAMAGE_POTION)){
          this.fall_height = 0
          return
        }

        this.fall_damage_sound_entity.getComponent(Transform).rotation = camera.rotation
        this.fall_damage_sound_entity.getComponent(Transform).position = camera.position
        this.fall_damage_sound_entity.getComponent(AudioSource).playOnce()

        this.take_damage(this.base_fall_damage * (this.fall_height / this.fall_damage_height_threshold))
        this.fall_height = 0
    }

    regenerate_hp(delta){
      if(!this.has_item(ItemID.HP_REGEN_UPGRADE_POTION)){
        return
      }

      if(this.hp >= this.max_hp){
        return
      }

      this.set_hp(this.get_hp() + (this.hp_recovery_per_second * delta))
    }

    recover_mana(delta){
      if(this.mp >= this.max_mp){
          return
      }

      this.set_mp(this.get_mp() + (this.mana_recovery_per_second * delta))
    }
  
    init_signals(){
      this.signal_callbacks[Player.HP_CHANGED] = []
      this.signal_callbacks[Player.MP_CHANGED] = []
      this.signal_callbacks[Player.MAX_HP_CHANGED] = []
      this.signal_callbacks[Player.MAX_MP_CHANGED] = []
      this.signal_callbacks[Player.ITEM_ADDED] = []
      this.signal_callbacks[Player.ORB_COUNT_CHANGED] = []
      this.signal_callbacks[Player.DIED] = []
      this.signal_callbacks[Player.TELEPORTED] = []
    }

    recover_hp(quantity){
      var new_hp = this.get_hp() + quantity

      if(new_hp > this.get_max_hp()){
        new_hp = this.get_max_hp()
      }

      this.set_hp(new_hp)
    }
  
    get_max_hp(){
      return this.max_hp
    }

    set_max_hp(max_hp){
      this.max_hp = max_hp
      this.emit_signal(Player.MAX_HP_CHANGED, this.max_hp)
      this.set_hp(max_hp)
    }
  
    get_hp(){
      return this.hp
    }
  
    set_hp(hp){
      this.hp = hp
      this.emit_signal(Player.HP_CHANGED, this.hp)

      if(this.hp <= 0){
        this.emit_signal(Player.DIED)
      }
    }
  
    get_max_mp(){
      return this.max_mp
    }

    set_max_mp(max_mp){
      this.max_mp = max_mp
      this.emit_signal(Player.MAX_MP_CHANGED, this.max_mp)
    }
  
    get_mp(){
      return this.mp
    }
  
    set_mp(mp){
      this.mp = mp
      this.emit_signal(Player.MP_CHANGED, this.mp)
    }

    get_mp_regen(){
      return this.mana_recovery_per_second
    }

    set_mp_regen(mp_regen){
      this.mana_recovery_per_second = mp_regen
    }

    set_fall_height(fall_height){
        this.fall_height = fall_height
    }
  
    add_item(item_id){
      this.inventory.push(item_id)
      this.emit_signal(Player.ITEM_ADDED, item_id)
    }
  
    has_item(item_id){
      for(var i = 0; i < this.inventory.length; i++){
        if(this.inventory[i] == item_id){
          return true
        }
      }
  
      return false
    }
  
    take_damage(damage){
      var new_hp = this.hp - damage
  
      if(new_hp < 0){
        new_hp = 0
      }
  
      this.set_hp(new_hp)
    }

    get_orbs(){
      return this.orbs
    }

    add_orbs(quantity){
      this.orbs += quantity
      this.emit_signal(Player.ORB_COUNT_CHANGED, this.orbs)
    }

    remove_orbs(quantity){
      this.orbs -= quantity
      this.emit_signal(Player.ORB_COUNT_CHANGED, this.orbs)
    }

    teleport(event){
      if(this.mp < this.teleport_mana_cost){
        return
      }

      if(!this.has_item(ItemID.TELEPORTATION_RING)){
        return
      }

      if(this.game_context.get_wizard().is_speaking){
        return
      }

      this.emit_signal(Player.TELEPORTED)
    
      this.set_mp(this.mp - this.teleport_mana_cost)
    
      var movement = {
        x: camera.position.x + event.direction.x * this.teleport_distance,
        y: camera.position.y + event.direction.y * this.teleport_distance, 
        z: camera.position.z + event.direction.z * this.teleport_distance
      }
    
      this.set_fall_height(0)
    
      movePlayerTo(movement)
      this.teleport_sound_entity.getComponent(Transform).rotation = camera.rotation
      this.teleport_sound_entity.getComponent(Transform).position = camera.position
      this.teleport_sound_entity.getComponent(AudioSource).playOnce()
    }
  }