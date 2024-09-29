// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const net = require('net');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// IPC 핸들러 수정
ipcMain.handle('request-map-list', async (event, ipAddress) => {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    const HOST = ipAddress || '192.168.45.50'; // 사용자로부터 받은 IP 주소
    const PORT = 19204; // Robot Status API 포트

    client.connect(PORT, HOST, () => {
      console.log('Connected to server');

      // API 요청 생성
      const requestBuffer = createMapListRequest();
      client.write(requestBuffer);
    });

    let responseBuffer = Buffer.alloc(0);

    client.on('data', (data) => {
      responseBuffer = Buffer.concat([responseBuffer, data]);

      // 응답 헤더(16바이트)가 수신되었는지 확인
      if (responseBuffer.length >= 16) {
        // 헤더 파싱
        const header = parseHeader(responseBuffer.slice(0, 16));
        const totalLength = 16 + header.dataLength;

        // 전체 메시지가 수신되었는지 확인
        if (responseBuffer.length >= totalLength) {
          const dataArea = responseBuffer.slice(16, totalLength);
          const jsonData = JSON.parse(dataArea.toString());

          if (jsonData.ret_code === 0) {
            resolve(jsonData.maps);
          } else {
            reject(jsonData.err_msg || 'Unknown error');
          }

          client.destroy(); // 연결 종료
        }
      }
    });

    client.on('error', (err) => {
      reject(`Connection error: ${err.message}`);
      client.destroy();
    });

    client.on('close', () => {
      console.log('Connection closed');
    });

    // 타임아웃 설정 (예: 5초)
    client.setTimeout(5000, () => {
      reject('Connection timed out');
      client.destroy();
    });
  });
});

// 메시지 헤더 생성 함수와 응답 헤더 파싱 함수는 이전과 동일합니다
function createMapListRequest() {
  const syncHeader = 0x5A;
  const version = 0x01;
  const serialNumber = 1; // 원하는 시리얼 넘버 설정 (0~65535)
  const dataLength = 0; // 데이터 영역 없음
  const apiNumber = 1300; // 0x0514
  const reserved = Buffer.alloc(6, 0x00); // 예약 영역

  const buffer = Buffer.alloc(16);
  buffer.writeUInt8(syncHeader, 0);
  buffer.writeUInt8(version, 1);
  buffer.writeUInt16BE(serialNumber, 2);
  buffer.writeUInt32BE(dataLength, 4);
  buffer.writeUInt16BE(apiNumber, 8);
  reserved.copy(buffer, 10);

  return buffer;
}

function parseHeader(buffer) {
  return {
    syncHeader: buffer.readUInt8(0),
    version: buffer.readUInt8(1),
    serialNumber: buffer.readUInt16BE(2),
    dataLength: buffer.readUInt32BE(4),
    apiNumber: buffer.readUInt16BE(8),
    reserved: buffer.slice(10, 16),
  };
}

// main.js

// 기존 코드 유지

// 새로운 IPC 핸들러 추가
ipcMain.handle('request-io-status', async (event, ipAddress) => {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
  
      const HOST = ipAddress || '192.168.45.50'; // 사용자로부터 받은 IP 주소
      const PORT = 19204; // Robot Status API 포트
  
      client.connect(PORT, HOST, () => {
        console.log('Connected to server for I/O status');
  
        // API 요청 생성
        const requestBuffer = createIOStatusRequest();
        client.write(requestBuffer);
      });
  
      let responseBuffer = Buffer.alloc(0);
  
      client.on('data', (data) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
  
        // 응답 헤더(16바이트)가 수신되었는지 확인
        if (responseBuffer.length >= 16) {
          // 헤더 파싱
          const header = parseHeader(responseBuffer.slice(0, 16));
          const totalLength = 16 + header.dataLength;
  
          // 전체 메시지가 수신되었는지 확인
          if (responseBuffer.length >= totalLength) {
            const dataArea = responseBuffer.slice(16, totalLength);
            const jsonData = JSON.parse(dataArea.toString());
  
            if (jsonData.ret_code === 0) {
              resolve(jsonData);
            } else {
              reject(jsonData.err_msg || 'Unknown error');
            }
  
            client.destroy(); // 연결 종료
          }
        }
      });
  
      client.on('error', (err) => {
        reject(`Connection error: ${err.message}`);
        client.destroy();
      });
  
      client.on('close', () => {
        console.log('Connection closed');
      });
  
      // 타임아웃 설정 (예: 5초)
      client.setTimeout(5000, () => {
        reject('Connection timed out');
        client.destroy();
      });
    });
  });
  
  // 새로운 API 요청 생성 함수 추가
  function createIOStatusRequest() {
    const syncHeader = 0x5a;
    const version = 0x01;
    const serialNumber = 1; // 원하는 시리얼 넘버 설정 (0~65535)
    const dataLength = 0; // 데이터 영역 없음
    const apiNumber = 1013; // 0x03F5
    const reserved = Buffer.alloc(6, 0x00); // 예약 영역
  
    const buffer = Buffer.alloc(16);
    buffer.writeUInt8(syncHeader, 0);
    buffer.writeUInt8(version, 1);
    buffer.writeUInt16BE(serialNumber, 2);
    buffer.writeUInt32BE(dataLength, 4);
    buffer.writeUInt16BE(apiNumber, 8);
    reserved.copy(buffer, 10);
  
    return buffer;
  }
  
  // 응답 헤더 파싱 함수는 기존과 동일
  function parseHeader(buffer) {
    return {
      syncHeader: buffer.readUInt8(0),
      version: buffer.readUInt8(1),
      serialNumber: buffer.readUInt16BE(2),
      dataLength: buffer.readUInt32BE(4),
      apiNumber: buffer.readUInt16BE(8),
      reserved: buffer.slice(10, 16),
    };
  }
  
  ipcMain.handle('request-estop-status', async (event, ipAddress) => {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
  
      const HOST = ipAddress || '192.168.45.50'; // 사용자로부터 받은 IP 주소
      const PORT = 19204; // Robot Status API 포트
  
      client.connect(PORT, HOST, () => {
        console.log('Connected to server for Estop status');
  
        // API 요청 생성
        const requestBuffer = createEstopStatusRequest();
        client.write(requestBuffer);
      });
  
      let responseBuffer = Buffer.alloc(0);
  
      client.on('data', (data) => {
        responseBuffer = Buffer.concat([responseBuffer, data]);
  
        // 응답 헤더(16바이트)가 수신되었는지 확인
        if (responseBuffer.length >= 16) {
          // 헤더 파싱
          const header = parseHeader(responseBuffer.slice(0, 16));
          const totalLength = 16 + header.dataLength;
  
          // 전체 메시지가 수신되었는지 확인
          if (responseBuffer.length >= totalLength) {
            const dataArea = responseBuffer.slice(16, totalLength);
            const jsonData = JSON.parse(dataArea.toString());
  
            if (jsonData.ret_code === 0) {
              resolve(jsonData);
            } else {
              reject(jsonData.err_msg || 'Unknown error');
            }
  
            client.destroy(); // 연결 종료
          }
        }
      });
  
      client.on('error', (err) => {
        reject(`Connection error: ${err.message}`);
        client.destroy();
      });
  
      client.on('close', () => {
        console.log('Connection closed');
      });
  
      // 타임아웃 설정 (예: 5초)
      client.setTimeout(5000, () => {
        reject('Connection timed out');
        client.destroy();
      });
    });
  });
  
  // 새로운 API 요청 생성 함수 추가
  function createEstopStatusRequest() {
    const syncHeader = 0x5a;
    const version = 0x01;
    const serialNumber = 1; // 원하는 시리얼 넘버 설정 (0~65535)
    const dataLength = 0; // 데이터 영역 없음
    const apiNumber = 1012; // 0x03F4
    const reserved = Buffer.alloc(6, 0x00); // 예약 영역
  
    const buffer = Buffer.alloc(16);
    buffer.writeUInt8(syncHeader, 0);
    buffer.writeUInt8(version, 1);
    buffer.writeUInt16BE(serialNumber, 2);
    buffer.writeUInt32BE(dataLength, 4);
    buffer.writeUInt16BE(apiNumber, 8);
    reserved.copy(buffer, 10);
  
    return buffer;
  }
  
  // 응답 헤더 파싱 함수는 기존과 동일
  function parseHeader(buffer) {
    return {
      syncHeader: buffer.readUInt8(0),
      version: buffer.readUInt8(1),
      serialNumber: buffer.readUInt16BE(2),
      dataLength: buffer.readUInt32BE(4),
      apiNumber: buffer.readUInt16BE(8),
      reserved: buffer.slice(10, 16),
    };
  }