# SocketBuffer

`SocketBuffer` is a class that provides a buffered interface for reading from a Node.js `Socket` object. It extends from the Node.js `EventEmitter` class and emits 'data' events whenever new data is received on the socket.

## Usage

```typescript
import { Socket } from 'net';
import SocketBuffer from './SocketBuffer';

const socket = new Socket();
const socketBuffer = new SocketBuffer(socket);

socketBuffer.on('data', () => {
  console.log('New data received');
});

socketBuffer.on('error', (error) => {
  console.error('An error occurred', error);
});

const data = await socketBuffer.read(1024);  // read 1024 bytes from the buffer
```

## API

### `new SocketBuffer(socket: Socket)`

Creates a new instance of `SocketBuffer` that wraps around the provided `Socket` object.

### `.read(length: number, timeout = 5000): Promise<Buffer | never>`

Reads `length` number of bytes from the buffer. If the buffer does not contain enough bytes, it waits until enough data is received. If the operation takes more than `timeout` milliseconds, it throws an 'Read operation timed out' error.

### Event: 'data'

Emitted whenever new data is received on the socket.

### Event: 'error'

Emitted whenever an error occurs on the socket.
