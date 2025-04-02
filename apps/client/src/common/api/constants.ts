import { serverURL } from '../../externals';

// API URLs
export const apiEntryUrl = `${serverURL}/data`;

export const projectDataURL = `${serverURL}/project`;
export const rundownURL = `${serverURL}/events`;
export const ontimeURL = `${serverURL}/ontime`;

export const userAssetsPath = 'user';
export const cssOverridePath = 'styles/override.css';
export const overrideStylesURL = `${serverURL}/${userAssetsPath}/${cssOverridePath}`;
export const projectLogoPath = `${serverURL}/${userAssetsPath}/logo`;
