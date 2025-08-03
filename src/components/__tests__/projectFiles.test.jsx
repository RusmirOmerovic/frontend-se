vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual, useState: vi.fn(), useEffect: vi.fn() };
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import ProjectFiles from '../ProjectFiles.jsx';
import { supabase, filesStore } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => {
  const filesStore = {};
  const storage = {
    upload: vi.fn(async (path, file) => {
      const dir = path.split('/').slice(0, -1).join('/');
      const name = path.split('/').pop();
      if (!filesStore[dir]) filesStore[dir] = [];
      filesStore[dir].push({ name, id: name });
      return { data: {}, error: null };
    }),
    list: vi.fn(async (path) => ({ data: filesStore[path] || [], error: null })),
    getPublicUrl: vi.fn((path) => ({
      data: { publicUrl: `https://example.com/${path}` },
    })),
  };
  return {
    supabase: { storage: { from: () => storage } },
    filesStore,
  };
});

describe('ProjectFiles', () => {
  beforeEach(() => {
    Object.keys(filesStore).forEach((key) => delete filesStore[key]);
    useState.mockReset();
    useEffect.mockReset();
    vi.clearAllMocks();
  });

  it('renders uploaded files with download links', async () => {
    const projectId = 1;
    const testFiles = [{ name: 'first.txt' }, { name: 'second.txt' }];

    const bucket = supabase.storage.from('project-files');
    for (const file of testFiles) {
      await bucket.upload(`project/${projectId}/${file.name}`, file);
    }

    const uploaded = filesStore[`project/${projectId}`];

    useState
      .mockImplementationOnce(() => [uploaded, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()]);
    useEffect.mockImplementation(() => {});

    const html = renderToString(<ProjectFiles projectId={projectId} />);

    testFiles.forEach((file) => {
      expect(html).toContain(file.name);
      expect(html).toContain(
        `href="https://example.com/project/${projectId}/${file.name}"`
      );
    });
  });
});

