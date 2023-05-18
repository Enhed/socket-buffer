import { Socket } from 'net';
import SocketBuffer from '../src/index';
import { EventEmitter } from 'events';

jest.mock('net')

describe('timeouts', () => {
    let mockSocket: jest.Mocked<EventEmitter & Partial<Socket>>;
    let socketBuffer: SocketBuffer;
    let data: Buffer

    beforeEach(() => {
        mockSocket = new EventEmitter() as jest.Mocked<EventEmitter & Partial<Socket>>;
        socketBuffer = new SocketBuffer(mockSocket as Socket);
        data = Buffer.from('test data')
    })

    it('should throw an error by timeout', () => {
        setTimeout(() => {
            mockSocket.emit('data', data)
        }, 100)

        expect(socketBuffer.read(1, 50)).rejects.toThrow(/timeout/i);
    })

    it('shouldn\'t throw an error by timeout', async () => {
        setTimeout(() => {
            mockSocket.emit('data', data)
        }, 50)

        const result = await socketBuffer.read(1, 100)
        expect(result[0]).toEqual(data[0])
    })
})
