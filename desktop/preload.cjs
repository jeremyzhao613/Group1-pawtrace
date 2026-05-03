const { contextBridge } = require('electron');

const apiBaseUrl = (process.env.PAWTRACE_API_BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

contextBridge.exposeInMainWorld('PAWTRACE_API_BASE_URL', apiBaseUrl);
