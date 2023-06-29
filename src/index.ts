import {Socket} from "net"
import EventEmitter from "events"

export default class SocketBuffer extends EventEmitter {
    private socket: Socket
    private buffer: Buffer

    constructor(socket: Socket) {
        super()

        this.socket = socket
        this.buffer = Buffer.alloc(0)

        socket.on('data', this.handleData.bind(this))
        socket.on('error', this.handleError.bind(this))
    }

    async read(length: number, timeout?: number): Promise<Buffer> {
        while (length > this.buffer.length) {
            await this.any(timeout)
        }

        return this.cut(length)
    }

    async until(value: number | number[], include: boolean = true, timeout?: number): Promise<Buffer> {
        const values = Buffer.from(Array.isArray(value) ? value : [value])
        let result = Buffer.alloc(0)
        const startTime = Date.now()

        while(!timeout || Date.now() - startTime > timeout) {
            const byte = await this.read(1, timeout)
            result = Buffer.concat([result, byte])
            const offset = result.length - values.length

            if(result.length < values.length ||
                Buffer.compare(result.subarray(offset), values) !== 0) continue

            return include ? result : result.subarray(0, offset)
        }

        throw new Error('Timeout error')
    }

    any(timeout?: number, ignoreBuffer: boolean = true): Promise<void> {
        if(!ignoreBuffer && this.buffer.length > 0) return Promise.resolve()

        return new Promise((resolve, reject) => {
            const timer = !timeout ? null : setTimeout(() => {
                clear()
                reject(new Error('Timeout waiting for data'))
            }, timeout)

            const onData = () => {
                clear()
                resolve()
            }

            const onError = (err: Error) => {
                clear()
                reject(err)
            }

            const clear = () => {
                if(timer) clearTimeout(timer)
                this.off('error', onError)
                this.off('data', onData)
            }

            this.once('data', onData)
            this.once('error', onError)
        })
    }

    private handleData(data: Buffer): void {
        this.buffer = Buffer.concat([this.buffer, data])
        this.emit('data')
    }

    private handleError(error: Error): void {
        this.emit('error', error)
    }

    private cut(length: number): Buffer {
        const sub = this.buffer.subarray(0, length)
        this.buffer = this.buffer.subarray(length)

        return sub
    }
}