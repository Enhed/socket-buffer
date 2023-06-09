import { Socket } from 'net';
import SocketBuffer from '../src/index'
import { EventEmitter } from 'events'

jest.mock('net')

describe('until', () => {
    let mockSocket: jest.Mocked<EventEmitter & Partial<Socket>>;
    let socketBuffer: SocketBuffer;
    let data: Buffer

    beforeEach(() => {
        mockSocket = new EventEmitter() as jest.Mocked<EventEmitter & Partial<Socket>>
        socketBuffer = new SocketBuffer(mockSocket as Socket)
        data = Buffer.from('test data~~')
    })

    it('until return equal buffer without include', async () => {
        mockSocket.emit('data', data)
        const result = await socketBuffer.until(0x7e, false)
        expect(result.toString()).toEqual('test data')
    })

    it('until return equal buffer with include', async () => {
        mockSocket.emit('data', data)
        const result = await socketBuffer.until([0x7e, 0x7e])
        expect(result.toString()).toEqual(data.toString())
    })

    it('should wait data without error', async () => {
        setTimeout(() => {
            mockSocket.emit('data', data)
        }, 100)

        const result = await socketBuffer.until([0x7e, 0x7e])
        expect(result.toString()).toEqual(data.toString())
    })


    it('should throw timeout error when has data but no entries', async () => {
        let scheduler = true;

        (async () => {
            while (scheduler) {
                await new Promise(resolve => setTimeout(resolve, 10))
                mockSocket.emit('data', Buffer.from([1]))
            }
        })()

        await expect(socketBuffer.until(0x7e, false, 100)).rejects.toThrow(/timeout/i)
        scheduler = false
    })
})
