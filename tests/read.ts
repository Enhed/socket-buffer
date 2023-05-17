import { Socket } from 'net'
import SocketBuffer from '../src/index'
import { EventEmitter } from 'events'

jest.mock('net')

describe('read', () => {
    let mockSocket: jest.Mocked<EventEmitter & Partial<Socket>>
    let socketBuffer: SocketBuffer

    beforeEach(() => {
        mockSocket = new EventEmitter() as jest.Mocked<EventEmitter & Partial<Socket>>;
        socketBuffer = new SocketBuffer(mockSocket as Socket);
    })

    it('should read data from the buffer', async () => {
        const data = Buffer.from('test data');
        mockSocket.emit('data', data);
        const result = await socketBuffer.read(data.length);
        expect(result.toString()).toEqual(data.toString());
    })

    it('should wait for data if buffer is empty', async () => {
        const data = Buffer.from('test data');
        setTimeout(() => mockSocket.emit('data', data), 50);
        const result = await socketBuffer.read(data.length);
        expect(result.toString()).toEqual(data.toString());
    })
});
