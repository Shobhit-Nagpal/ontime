import express from 'express';
import type { Request, Response } from 'express';

import {
  createProjectFile,
  currentProjectDownload,
  deleteProjectFile,
  duplicateProjectFile,
  listProjects,
  loadDemo,
  loadProject,
  patchPartialProjectFile,
  postProjectFile,
  projectDownload,
  quickProjectFile,
  renameProjectFile,
} from './db.controller.js';
import { uploadProjectFile } from './db.middleware.js';
import {
  validateFilenameBody,
  validateFilenameParam,
  validateNewFilenameBody,
  validateNewProject,
  validatePatchProject,
  validateQuickProject,
} from './db.validation.js';
import { getDataProvider } from '../../classes/data-provider/DataProvider.js';

export const router = express.Router();

router.get('/profile', (_req: Request, res: Response) => {
  res.status(200).json(getDataProvider().getProfile());
});

router.get('/', currentProjectDownload);
router.post('/download', validateFilenameBody, projectDownload);
router.post('/upload', uploadProjectFile, postProjectFile);

router.patch('/', validatePatchProject, patchPartialProjectFile);
router.post('/new', validateFilenameBody, validateNewProject, createProjectFile);
router.post('/quick', validateQuickProject, quickProjectFile);

router.get('/all', listProjects);

router.post('/load', validateFilenameBody, loadProject);
router.post('/demo', loadDemo);
router.post('/:filename/duplicate', validateFilenameParam, validateNewFilenameBody, duplicateProjectFile);
router.put('/:filename/rename', validateFilenameParam, validateNewFilenameBody, renameProjectFile);
router.delete('/:filename', validateFilenameParam, deleteProjectFile);
