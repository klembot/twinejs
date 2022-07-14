import {app} from 'electron';
import {initApp} from './init-app';

app.on('ready', initApp);
app.on('window-all-closed', () => app.quit());
