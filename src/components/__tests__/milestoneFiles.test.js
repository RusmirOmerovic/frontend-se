vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return { ...actual, useState: vi.fn(), useEffect: vi.fn() };
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import MilestoneFiles from '../MilestoneFiles.jsx';
import { supabase, storageStore, dbStore } from '../../supabaseClient.js';

vi.mock('../../supabaseClient.js', () => {
  const storageStore = {};
  const dbStore = {};

  const storage = {
    upload: vi.fn(async (path, file) => {
      const parts = path.split('/');
      const dir = parts.slice(0, -1).join('/');
      const name = parts.pop();
      if (!storageStore[dir]) storageStore[dir] = [];
      storageStore[dir].push({ name, path });
      return { data: {}, error: null };
    }),
    remove: vi.fn(async (paths) => {
      paths.forEach((p) => {
        const dir = p.split('/').slice(0, -1).join('/');
        const name = p.split('/').pop();
        if (storageStore[dir]) {
          storageStore[dir] = storageStore[dir].filter((f) => f.name !== name);
        }
      });
      return { data: {}, error: null };
    }),
    list: vi.fn(async (path) => ({ data: storageStore[path] || [], error: null })),
    getPublicUrl: vi.fn((path) => ({
      data: { publicUrl: `https://example.com/${path}` },
    })),
  };

  const from = vi.fn((table) => {
    if (table === 'milestone_files') {
      return {
        insert: vi.fn(async (rows) => {
          rows.forEach((r) => {
            if (!dbStore[r.milestone_id]) dbStore[r.milestone_id] = [];
            dbStore[r.milestone_id].push({
              id: r.id || r.name,
              name: r.name,
              path: r.path,
            });
          });
          return { data: {}, error: null };
        }),
        delete: vi.fn(() => ({
          eq: vi.fn(async (col, value) => {
            Object.keys(dbStore).forEach((k) => {
              dbStore[k] = dbStore[k].filter((f) => f.id !== value);
            });
            return { data: {}, error: null };
          }),
        })),
        select: vi.fn(() => ({
          eq: vi.fn(async (col, value) => ({
            data: dbStore[value] || [],
            error: null,
          })),
        })),
      };
    }
    return {};
  });

  return {
    supabase: { storage: { from: () => storage }, from },
    storageStore,
    dbStore,
  };
});

describe('MilestoneFiles', () => {
  beforeEach(() => {
    Object.keys(storageStore).forEach((k) => delete storageStore[k]);
    Object.keys(dbStore).forEach((k) => delete dbStore[k]);
    useState.mockReset();
    useEffect.mockReset();
    vi.clearAllMocks();
  });

  it('renders uploaded files with delete buttons', async () => {
    const milestoneId = 1;
    const testFiles = [{ name: 'a.txt' }, { name: 'b.txt' }];

    const bucket = supabase.storage.from('milestone-files');
    for (const file of testFiles) {
      const path = `milestone/${milestoneId}/${file.name}`;
      await bucket.upload(path, file);
      await supabase
        .from('milestone_files')
        .insert([{ name: file.name, path, milestone_id: milestoneId }]);
    }

    const uploaded = dbStore[milestoneId];

    useState
      .mockImplementationOnce(() => [uploaded, vi.fn()])
      .mockImplementationOnce(() => [false, vi.fn()]);
    useEffect.mockImplementation(() => {});

    const html = renderToString(
      React.createElement(MilestoneFiles, { milestoneId })
    );

    testFiles.forEach((file) => {
      expect(html).toContain(file.name);
      expect(html).toContain('Löschen');
    });
  });
});
