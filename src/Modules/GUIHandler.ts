import {ObjetiveHandler} from "./ObjectiveHandler"
import {Timer} from "./Timer"
import {Player} from "./Player"
import {ItemID} from "./Item";

const canvas = new UICanvas();
var g_game_context

export class GUIHandler {
    game_context
    objective_handler
    main_game_gui
    player_info_gui

    constructor(game_context){
        var game_timer

        this.game_context = game_context
        g_game_context = game_context

        this.objective_handler = this.game_context.get_objective_handler()
        this.objective_handler.connect(
            ObjetiveHandler.TARGET_DESTROYED_COUNT_CHANGED,
            this,
            "on_target_destroyed_count_changed"
        )

        game_timer = this.game_context.get_game_timer()
        game_timer.connect(
            Timer.TIME_CHANGED,
            this,
            "on_game_timer_time_changed"
        )

        this.main_game_gui = new MainGameGUI()
        this.player_info_gui = new PlayerInfoGUI()
    }

    show_main_game_gui(){
        this.main_game_gui.show()
    }

    hide_main_game_gui(){
        this.main_game_gui.hide()
    }

    on_game_timer_time_changed(time){
        this.main_game_gui.set_current_time(Math.floor(time))
    }

    on_target_destroyed_count_changed(count){
        this.main_game_gui.set_target_count_text(count.toString())
    }
}

class MainGameGUI {
    target_count_icon_texture = new Texture("Images/TargetIcon.png")
    timer_icon_texture = new Texture("Images/Hourglass1.png")

    main_container
    target_count_container
    target_count_icon
    target_count_text

    timer_container
    timer_icon
    timer_icon_animation_timer
    timer_text

    timer_animation = [
        new Texture("Images/Hourglass1.png"),
        new Texture("Images/Hourglass2.png"),
        new Texture("Images/Hourglass3.png"),
        new Texture("Images/Hourglass4.png"),
        new Texture("Images/Hourglass5.png"),
        new Texture("Images/Hourglass1.png")
    ]

    max_timer_animation_frame = 5
    current_timer_animation_frame = 0

    constructor(){
        this.init_main_container()
        this.init_target_count_container()
        this.init_timer_container()
        this.init_timer_icon_animation_timer()

        this.main_container.visible = false
    }

    init_main_container(){
        this.main_container = new UIContainerStack(canvas)
        this.main_container.adaptWidth = true
        this.main_container.width = "40%"
        this.main_container.positionY = 100
        this.main_container.positionX = 10
        this.main_container.color = Color4.FromHexString("#FF000000")
        this.main_container.hAlign = "left"
        this.main_container.vAlign = "bottom"
        this.main_container.stackOrientation = UIStackOrientation.VERTICAL
    }

    init_target_count_container(){
        this.target_count_container = new UIContainerStack(this.main_container)
        this.target_count_container.adaptWidth = true
        this.target_count_container.color = Color4.FromHexString("#EDEDEDED")
        this.target_count_container.hAlign = "left"
        this.target_count_container.vAlign = "bottom"
        this.target_count_container.stackOrientation = UIStackOrientation.HORIZONTAL

        this.target_count_icon = new UIImage(this.target_count_container, this.target_count_icon_texture)
        this.target_count_icon.width = "64px"
        this.target_count_icon.height = "64px"
        this.target_count_icon.sourceWidth = 512
        this.target_count_icon.sourceHeight = 512

        this.target_count_text = new UIText(this.target_count_container)
        this.target_count_text.value = "0"
        this.target_count_text.font = new Font()
        this.target_count_text.fontSize = 20
        this.target_count_text.positionX = "70%"
        this.target_count_text.positionY = "10%"
        this.target_count_text.color = Color4.Black()
    }

    init_timer_container(){
        this.timer_container = new UIContainerStack(this.main_container)
        this.timer_container.adaptWidth = true
        this.timer_container.color = Color4.FromHexString("#EDEDEDED")
        this.timer_container.hAlign = "left"
        this.timer_container.vAlign = "bottom"
        this.timer_container.stackOrientation = UIStackOrientation.HORIZONTAL

        this.timer_icon = new UIImage(this.timer_container, this.timer_icon_texture)
        this.timer_icon.width = "64px"
        this.timer_icon.height = "64px"
        this.timer_icon.sourceWidth = 724
        this.timer_icon.sourceHeight = 724

        this.timer_text = new UIText(this.timer_container)
        this.timer_text.value = "0"
        this.timer_text.font = new Font()
        this.timer_text.fontSize = 20
        this.timer_text.positionX = "70%"
        this.timer_text.positionY = "10%"
        this.timer_text.color = Color4.Black()
    }

    init_timer_icon_animation_timer(){
        this.timer_icon_animation_timer = new Timer()
        this.timer_icon_animation_timer.set_max_time(0.2)
        this.timer_icon_animation_timer.connect(
            Timer.TIMEOUT_SIGNAL, 
            this, 
            "on_timer_icon_animation_timer_timeout"
        )

        this.timer_icon_animation_timer.start()
    }

    set_target_count_text(text){
        this.target_count_text.value = text
    }

    set_current_time(time){
        this.timer_text.value = time
    }

    show(){
        this.main_container.visible = true
    }

    hide(){
        this.main_container.visible = false
        this.target_count_text.value = "0"
        this.timer_text.value = "0"
    }

    on_timer_icon_animation_timer_timeout(){
        this.timer_icon.source = this.timer_animation[this.current_timer_animation_frame]

        this.current_timer_animation_frame += 1

        if(this.current_timer_animation_frame > this.max_timer_animation_frame){
            this.current_timer_animation_frame = 0
            this.timer_icon_animation_timer.start()
            return
        }

        this.timer_icon_animation_timer.start()
    }
}

class PlayerInfoGUI{
    energy_icon_texture = new Texture("Images/TargetIcon.png")

    main_container

    energy_container
    energy_icon
    energy_text
    energy_update_timer
    energy_update_sound_entity
    next_energy_quantity

    bars_container
    life_bar
    mana_bar

    teleport_icon

    constructor(){
        this.init_main_container()
        this.init_energy_container()
        this.init_bars_container()
        this.init_energy_update_timer()
        this.init_sound_entity()
        this.life_bar = new LifeBar(canvas)
        this.mana_bar = new ManaBar(canvas)
        this.teleport_icon = new TeleportIcon(canvas)
        this.connect_player_signals()
    }

    connect_player_signals(){
        var player = g_game_context.get_player()

        player.connect(
            Player.HP_CHANGED,
            this.life_bar,
            "on_value_changed"
        )

        player.connect(
            Player.MP_CHANGED,
            this.mana_bar,
            "on_value_changed"
        )

        player.connect(
            Player.MAX_HP_CHANGED,
            this.life_bar,
            "on_max_value_changed"
        )

        player.connect(
            Player.MAX_MP_CHANGED,
            this.mana_bar,
            "on_max_value_changed"
        )

        player.connect(
            Player.ITEM_ADDED,
            this,
            "on_player_item_added"
        )

        player.connect(
            Player.ORB_COUNT_CHANGED,
            this,
            "on_player_orb_count_changed"
        )
    }

    init_energy_update_timer(){
        this.energy_update_timer = new Timer()
        this.energy_update_timer.set_max_time(0.05)
        this.energy_update_timer.connect(
            Timer.TIMEOUT_SIGNAL,
            this,
            "update_energy"
        )
    }

    init_main_container(){
        this.main_container = new UIContainerStack(canvas)
        this.main_container.width = "50%"
        this.main_container.adaptHeight = true
        this.main_container.color = Color4.FromHexString("#FF000000")
        this.main_container.hAlign = "center"
        this.main_container.vAlign = "bottom"
        this.main_container.stackOrientation = UIStackOrientation.VERTICAL
        this.main_container.positionX = "0%"
        this.main_container.positionY = "0%"
    }

    init_energy_container(){
        var player = g_game_context.get_player()

        this.energy_container = new UIContainerStack(this.main_container)
        this.energy_container.color = Color4.FromHexString("#EDEDEDED")
        this.energy_container.hAlign = "center"
        this.energy_container.vAlign = "center"
        this.energy_container.stackOrientation = UIStackOrientation.HORIZONTAL

        this.energy_icon = new UIImage(this.energy_container, this.energy_icon_texture)
        this.energy_icon.width = "48px"
        this.energy_icon.height = "48px"
        this.energy_icon.sourceWidth = 512
        this.energy_icon.sourceHeight = 512

        this.energy_text = new UIText(this.energy_container)
        this.energy_text.value = player.get_orbs().toString()
        this.energy_text.font = new Font()
        this.energy_text.fontSize = 20
        this.energy_text.color = Color4.Black()
        this.energy_text.positionX = "50%"
        this.energy_text.positionY = "27%"
    }

    init_bars_container(){
        this.energy_container = new UIContainerStack(canvas)
        this.energy_container.color = Color4.FromHexString("#FF000000")
        this.energy_container.hAlign = "center"
        this.energy_container.vAlign = "bottom"
        this.energy_container.stackOrientation = UIStackOrientation.VERTICAL
    }

    init_sound_entity(){
        var clip = new AudioClip("Sounds/EnergyPickUp3.wav")
        var source = new AudioSource(clip)
  
        this.energy_update_sound_entity = new Entity()
        this.energy_update_sound_entity.addComponent(source)
        this.energy_update_sound_entity.addComponent(new Transform())
  
        engine.addEntity(this.energy_update_sound_entity)
    }

    update_energy(){
        var current_energy = parseInt(this.energy_text.value)

        if(current_energy == this.next_energy_quantity){
            return
        }

        if(current_energy < this.next_energy_quantity){
            current_energy += 1
        }

        if(current_energy > this.next_energy_quantity){
            current_energy -= 1
        }

        this.energy_text.value = current_energy.toString()

        this.energy_update_sound_entity.getComponent(Transform).position = Camera.instance.position
        this.energy_update_sound_entity.getComponent(AudioSource).playOnce()

        this.energy_update_timer.start()
    }

    on_player_item_added(item_id){
        if(item_id == ItemID.TELEPORTATION_RING){
            this.teleport_icon.show()
        }
    }

    on_player_orb_count_changed(quantity){
        log(quantity)
        this.next_energy_quantity = quantity
        this.energy_update_timer.start()
    }
}

class ValueBar{
    background
    background_color = Color4.Black()
    background_width = 100
    background_height = 100

    bar
    bar_color = Color4.Red()
    bar_width = 100
    bar_height = 100

    max_value = 100
    value = 100

    constructor(container){
        this.background = new UIContainerRect(container)
        this.background.adaptWidth = false
        this.background.color = this.background_color
        this.background.hAlign = "center"
        this.background.vAlign = "bottom"
        this.background.width = "100px"
        this.background.height = "100px"

        this.bar = new UIContainerRect(container)
        this.bar.adaptWidth = false
        this.bar.color = this.bar_color
        this.bar.hAlign = "center"
        this.bar.vAlign = "bottom"
        this.bar.width = "100px"
        this.bar.height = "100px"
    }

    set_max_value(max_value){
        this.max_value = max_value
    }

    set_bar_color(color){
        this.bar_color = color
        this.bar.color = color
    }

    on_value_changed(new_value){
        if(new_value < 0){
            new_value = 0
        }

        if(new_value > this.max_value){
            new_value = this.max_value
        }

        var pct = new_value / this.max_value

        var color = new Color4(
            this.bar_color.r * pct,
            this.bar_color.g * pct,
            this.bar_color.b * pct,
            1
        )

        this.bar.color = color
        this.bar.width = this.bar_width * pct
        this.bar.height = this.bar_height * pct
    }

    on_max_value_changed(new_value){
        this.set_max_value(new_value)
    }
}

class LifeBar extends ValueBar{
    constructor(container){
        super(container)

        this.set_bar_color(Color4.Red())

        this.background.positionY = "0%"
        this.background.positionX = "-10%"
        this.bar.positionY = "0%"
        this.bar.positionX = "-10%"
    }
}

class ManaBar extends ValueBar{
    constructor(container){
        super(container)

        this.set_bar_color(Color4.Blue())

        this.background.positionY = "0%"
        this.background.positionX = "10%"
        this.bar.positionY = "0%"
        this.bar.positionX = "10%"
    }
}

class TeleportIcon{
    icon_texture = new Texture("Images/ArcaneRing.png")

    container
    icon
    text

    constructor(container){
        this.container = new UIContainerStack(container)
        this.container.color = Color4.FromHexString("#EDEDEDED")
        this.container.hAlign = "center"
        this.container.vAlign = "bottom"
        this.container.stackOrientation = UIStackOrientation.HORIZONTAL
        this.container.width = "48px"
        this.container.height = "48px"
        this.container.positionX = "11.5%"
        this.container.positionY = "18%"

        this.icon = new UIImage(container, this.icon_texture)
        this.icon.width = "48px"
        this.icon.height = "48px"
        this.icon.sourceWidth = 512
        this.icon.sourceHeight = 512
        this.icon.hAlign = "center"
        this.icon.vAlign = "bottom"
        this.icon.positionX = "11.5%"
        this.icon.positionY = "18%"

        this.text = new UIText(container)
        this.text.value = "E"
        this.text.font = new Font()
        this.text.fontSize = 15
        this.text.color = Color4.Black()
        this.text.hAlign = "center"
        this.text.vAlign = "bottom"
        this.text.positionX = "13.3%"
        this.text.positionY = "18%"

        this.hide()
    }

    show(){
        this.container.visible = true
        this.icon.visible = true
        this.text.visible = true
    }

    hide(){
        this.container.visible = false
        this.icon.visible = false
        this.text.visible = false
    }
}