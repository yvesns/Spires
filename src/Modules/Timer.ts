import {SignalClass} from "./SignalClass"

export class Timer extends SignalClass{
    static TIMEOUT_SIGNAL = 0
    static TIME_CHANGED = 1

    max_time = 60
    current_time = 60
    started = false
    auto_repeat = false

    constructor(){
        super()
        this.init_signals()
        engine.addSystem(this)
    }

    init_signals(){
        this.signal_callbacks[Timer.TIMEOUT_SIGNAL] = []
        this.signal_callbacks[Timer.TIME_CHANGED] = []
    }

    get_max_time(){
        return this.max_time
    }

    set_max_time(time){
        this.max_time = time
        this.current_time = time
    }

    start(){
        this.current_time = this.max_time
        this.started = true
    }

    stop(){
        this.started = false
    }

    reset(){
        this.current_time = this.max_time
    }

    update(delta){
        if(!this.started){
            return
        }

        this.current_time -= delta

        if(this.current_time >= 0){
            this.emit_signal(Timer.TIME_CHANGED, this.current_time)
        } else {
            this.emit_signal(Timer.TIME_CHANGED, 0)
        }

        if(this.current_time > 0){
            return
        }

        this.reset()

        if(!this.auto_repeat){
            this.stop()
        }

        this.emit_signal(Timer.TIMEOUT_SIGNAL)
    }
}