import {Socket} from "net"
import EventEmitter from "events"

export default class SocketBuffer extends EventEmitter {
    private socket: Socket
    private buffer: Buffer

    constructor(socket: Socket) {
        super()

        this.socket = socket
        this.buffer = Buffer.alloc(0)

        const self = this

        socket.on('data', (data: Buffer) => {
            self.buffer = Buffer.concat([self.buffer, data])
            // console.log('SocketHandler get data', data.toString('hex'), self.buffer.length)
            self.emit('data')
        })
    }

    async read(length: number): Promise<Buffer> {
        while (length > this.buffer.length) {
            await this.any()
        }

        return this.cut(length)
    }

    any(): Promise<void> {
        return new Promise((resolve) => {
            this.once('data', resolve)
        })
    }

    private cut(length: number): Buffer {
        const sub = this.buffer.subarray(0, length)
        this.buffer = this.buffer.subarray(length)

        return sub
    }
}