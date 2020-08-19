import {
  Menu,
  BrowserWindow,
  shell,
  app,
  MenuItemConstructorOptions,
  MenuItem,
  ipcMain,
  Event,
  IpcMainEvent,
} from 'electron';
import { format as formatURL } from 'url';
import openAboutWindow from 'about-window';
import * as path from 'path';
import { prefs } from './prefs';
import { bugs } from '../package.json';

const openRoR2Directory = (dir: string = '') => {
  const openPath = path.join(prefs.get('ror2_path') as string, dir);
  return () => shell.openPath(openPath);
};

const profiles: string[] = [];
let selectedProfile: string;

const generateTemplate = (): MenuItemConstructorOptions[] => [
  {
    label: 'File',
    submenu: [{ role: 'quit' }],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    label: 'Profile',
    submenu: [
      {
        label: 'Import',
        click: () =>
          BrowserWindow.getFocusedWindow().webContents.send('importProfile'),
      },
      {
        label: 'Export',
        click: () =>
          BrowserWindow.getFocusedWindow().webContents.send('exportProfile'),
      },
      {
        type: 'separator',
      },
      {
        label: 'Rename Profile',
        click: (item: MenuItem, window: BrowserWindow) => {
          window.webContents.send('renameProfile');
        },
      },
      {
        label: 'Delete Profile',
        enabled: profiles.length > 1,
        click: (item: MenuItem, window: BrowserWindow) => {
          window.webContents.send('deleteProfile');
        },
      },
      { type: 'separator' },
      {
        label: 'Switch Profile',
        submenu: [
          ...profiles.map(
            (p): MenuItemConstructorOptions => ({
              label: p,
              type: 'radio',
              checked: p === selectedProfile,
              enabled: p !== selectedProfile,
              click: handleSwitchProfile,
              id: p,
            })
          ),
        ],
      },
      { type: 'separator' },
      {
        label: 'New Profile',
        click: (item: MenuItem, window: BrowserWindow) => {
          window.webContents.send('newProfile');
        },
      },
    ],
  },
  {
    label: 'Directories',
    submenu: [
      { label: 'Risk of Rain 2 Install', click: openRoR2Directory() },
      {
        label: 'BepInEx',
        submenu: [
          { label: 'Main Directory', click: openRoR2Directory('BepInEx') },
          {
            label: 'Config Directory',
            click: openRoR2Directory('BepInEx/config'),
          },
          {
            label: 'Plugins Directory',
            click: openRoR2Directory('BepInEx/plugins'),
          },
        ],
      },
      {
        label: 'Download Cache',
        click: () =>
          shell.openPath(path.join(app.getPath('userData'), 'downloadCache')),
      },
      {
        label: 'Temporary files',
        click: () =>
          shell.openPath(path.join(app.getPath('temp'), app.getName())),
      },
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Report a bug',
        click: () => {
          shell.openExternal(
            formatURL({
              pathname: bugs.url,
              query: { template: 'bug_report.md', title: '[BUG]' },
            })
          );
        },
      },
      {
        label: 'Feature Request',
        click: () => {
          shell.openExternal(
            formatURL({
              pathname: bugs.url,
              query: { template: 'feature_request.md', title: '[FEATURE]' },
            })
          );
        },
      },
      {
        type: 'separator',
      },

      {
        role: 'about',
        click: () => {
          openAboutWindow({
            icon_path: path.join(__dirname, '../dist/favicon.png'),
            package_json_dir: path.join(__dirname, '..'),
            win_options: {
              autoHideMenuBar: true,
              webPreferences: { nodeIntegration: true },
            },
          });
        },
      },
    ],
  },
];

function handleSwitchProfile(
  menuItem: MenuItem,
  browserWindow: BrowserWindow,
  event: Event
) {
  menuItem.checked = false;
  const oldItem = Menu.getApplicationMenu().getMenuItemById(selectedProfile);
  if (oldItem) {
    oldItem.checked = true;
  }
  browserWindow.webContents.send('switchProfile', menuItem.label);
}

const rebuildMenu = () => {
  // const oldMenu = Menu.getApplicationMenu();
  // if ((oldMenu as any).dispose) {
  //   (oldMenu as any).dispose();
  // }
  // Potentially there is a memory leak here depending on how
  // electron deals with creating new memory
  const menu = Menu.buildFromTemplate(generateTemplate());
  Menu.setApplicationMenu(menu);
  return menu;
};

export const configureApplicationMenu = () => {
  const menu = rebuildMenu();

  ipcMain.on(
    'addProfile',
    (event: IpcMainEvent, ...addedProfiles: string[]) => {
      if (addedProfiles.length > 0) {
        profiles.push(...addedProfiles);
        if (!selectedProfile) selectedProfile = addedProfiles[0];
        rebuildMenu();
      }

      event.returnValue = profiles;
    }
  );

  ipcMain.on('removeProfile', (event: IpcMainEvent, profile: string) => {
    const profIndex = profiles.indexOf(profile);
    if (profIndex !== -1) {
      profiles.splice(profIndex, 1);
      rebuildMenu();
    }

    event.returnValue = profiles;
  });

  ipcMain.on(
    'renameProfile',
    (event: IpcMainEvent, oldName: string, newName: string) => {
      const profIndex = profiles.indexOf(oldName);
      if (profIndex !== -1) {
        profiles.splice(profIndex, 1, newName);
        rebuildMenu();
        event.returnValue = newName;
      } else {
        event.returnValue = null;
      }
    }
  );

  ipcMain.on('clearProfiles', (event: IpcMainEvent) => {
    profiles.splice(0, profiles.length);
    rebuildMenu();

    event.returnValue = profiles;
  });

  ipcMain.on('switchProfile', (event: IpcMainEvent, profile: string) => {
    const currMenu = Menu.getApplicationMenu();
    const oldMenuItem = currMenu.getMenuItemById(selectedProfile);
    if (oldMenuItem) {
      oldMenuItem.checked = false;
      oldMenuItem.enabled = true;
    }

    const newMenuItem = currMenu.getMenuItemById(profile);
    if (!newMenuItem) event.sender.send('print', `Unkown profile ${profile}`);
    newMenuItem.checked = true;
    newMenuItem.enabled = false;
    selectedProfile = profile;

    event.returnValue = selectedProfile;
  });

  return menu;
};
