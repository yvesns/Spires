export class SignalClass {
    signal_callbacks = []

    connect(signal, object, callback){
        this.signal_callbacks[signal].push([object, callback])  
    }

    emit_signal(signal, ...args){
        var element

        for(var i = 0; i < this.signal_callbacks[signal].length; i++){
            element = this.signal_callbacks[signal][i]
            element[0][element[1]](...args)
        }
    }
}