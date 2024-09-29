// renderer.js

document.getElementById('jsonReadBtn').addEventListener('click', () => {
    const ipAddress = document.getElementById('ipAddress').value.trim();
  
    // 에러 메시지 초기화
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
  
    window.ipcRenderer.invoke('request-map-list', ipAddress).then((maps) => {
      const mapList = document.getElementById('mapList');
      mapList.innerHTML = '';
  
      maps.forEach((map) => {
        const li = document.createElement('li');
        li.textContent = map;
        mapList.appendChild(li);
      });
    }).catch((error) => {
      console.error('Error fetching map list:', error);
      errorMessage.textContent = `Error: ${error}`;
    });
  });

  // renderer.js

// 기존 코드 유지

document.getElementById('ioStatusBtn').addEventListener('click', () => {
    const ipAddress = document.getElementById('ipAddress').value.trim();
  
    // 에러 메시지 초기화
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
  
    window.ipcRenderer
      .invoke('request-io-status', ipAddress)
      .then((ioStatus) => {
        const ioStatusDiv = document.getElementById('ioStatus');
        ioStatusDiv.innerHTML = '';
  
        // DI 표시
        const diTitle = document.createElement('h3');
        diTitle.textContent = 'Digital Inputs (DI):';
        ioStatusDiv.appendChild(diTitle);
  
        const diList = document.createElement('ul');
        ioStatus.DI.forEach((di) => {
          const li = document.createElement('li');
          li.textContent = `ID: ${di.id}, Source: ${di.source}, Status: ${
            di.status ? 'High' : 'Low'
          }, Valid: ${di.valid ? 'Yes' : 'No'}`;
          diList.appendChild(li);
        });
        ioStatusDiv.appendChild(diList);
  
        // DO 표시
        const doTitle = document.createElement('h3');
        doTitle.textContent = 'Digital Outputs (DO):';
        ioStatusDiv.appendChild(doTitle);
  
        const doList = document.createElement('ul');
        ioStatus.DO.forEach((doItem) => {
          const li = document.createElement('li');
          li.textContent = `ID: ${doItem.id}, Source: ${doItem.source}, Status: ${
            doItem.status ? 'High' : 'Low'
          }`;
          doList.appendChild(li);
        });
        ioStatusDiv.appendChild(doList);
      })
      .catch((error) => {
        console.error('Error fetching I/O status:', error);
        errorMessage.textContent = `Error: ${error}`;
      });
  });
  
  document.getElementById('estopStatusBtn').addEventListener('click', () => {
    const ipAddress = document.getElementById('ipAddress').value.trim();
  
    // 에러 메시지 초기화
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = '';
  
    window.ipcRenderer
      .invoke('request-estop-status', ipAddress)
      .then((estopStatus) => {
        const estopStatusDiv = document.getElementById('estopStatus');
        estopStatusDiv.innerHTML = '';
  
        // Estop 상태 표시
        const emergency = estopStatus.emergency ? 'Activated' : 'Inactive';
        const driverEmc = estopStatus.driver_emc ? 'Yes' : 'No';
        const electric = estopStatus.electric ? 'On' : 'Off';
        const softEmc = estopStatus.soft_emc ? 'Yes' : 'No';
  
        estopStatusDiv.innerHTML = `
          <p><strong>Emergency Stop Button:</strong> ${emergency}</p>
          <p><strong>Driver Emergency Stop:</strong> ${driverEmc}</p>
          <p><strong>Relay Status:</strong> ${electric}</p>
          <p><strong>Soft Emergency Stop:</strong> ${softEmc}</p>
        `;
      })
      .catch((error) => {
        console.error('Error fetching Estop status:', error);
        errorMessage.textContent = `Error: ${error}`;
      });
  });