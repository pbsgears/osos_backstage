/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { GitLabIntegrationConfig } from './config';
import { getGitLabFileFetchUrl } from './core';

const worker = setupServer();

describe('gitlab core', () => {
  beforeAll(() => worker.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => worker.close());
  afterEach(() => worker.resetHandlers());

  beforeEach(() => {
    worker.use(
      rest.get('*/api/v4/projects/:name', (_, res, ctx) =>
        res(ctx.status(200), ctx.json({ id: 12345 })),
      ),
    );
  });

  const configWithToken: GitLabIntegrationConfig = {
    host: 'gitlab.com',
    token: '0123456789',
    apiBaseUrl: '<ignored>',
    baseUrl: '<ignored>',
  };

  const configWithNoToken: GitLabIntegrationConfig = {
    host: 'gitlab.com',
    apiBaseUrl: '<ignored>',
    baseUrl: '<ignored>',
  };

  const configSelfHosteWithRelativePath: GitLabIntegrationConfig = {
    host: 'gitlab.mycompany.com',
    token: '0123456789',
    apiBaseUrl: '<ignored>',
    baseUrl: 'https://gitlab.mycompany.com/gitlab',
  };

  const configSelfHostedWithoutRelativePath: GitLabIntegrationConfig = {
    host: 'gitlab.mycompany.com',
    token: '0123456789',
    apiBaseUrl: '<ignored>',
    baseUrl: 'https://gitlab.mycompany.com',
  };

  describe('getGitLabFileFetchUrl with .yaml extension', () => {
    it.each([
      // Project URLs
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yaml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      {
        config: configSelfHosteWithRelativePath,
        url: 'https://gitlab.mycompany.com/gitlab/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yaml',
        result:
          'https://gitlab.mycompany.com/gitlab/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      {
        config: configSelfHostedWithoutRelativePath,
        url: 'https://gitlab.mycompany.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yaml',
        result:
          'https://gitlab.mycompany.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        // Works with non URI encoded link
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yaml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yaml/raw?ref=branch',
      },
      {
        config: configSelfHosteWithRelativePath,
        url: 'https://gitlab.mycompany.com/gitlab/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yaml',
        result:
          'https://gitlab.mycompany.com/gitlab/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yaml/raw?ref=branch',
      },
      {
        config: configSelfHostedWithoutRelativePath,
        url: 'https://gitlab.mycompany.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yaml',
        result:
          'https://gitlab.mycompany.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yaml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yaml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      {
        config: configWithToken,
        url: 'https://gitlab.example.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yaml',
        result:
          'https://gitlab.example.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yaml', // Repo not in subgroup
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yaml/raw?ref=branch',
      },
      // Raw URLs
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a/b/blob/master/c.yaml',
        result: 'https://gitlab.example.com/a/b/raw/master/c.yaml',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a/b/repo/blob/master/c.yaml',
        result: 'https://gitlab.example.com/a/b/repo/raw/master/c.yaml',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a/blob/blob/master/c.yaml',
        result: 'https://gitlab.example.com/a/blob/raw/master/c.yaml',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a/b/blob/blob/c.yaml',
        result: 'https://gitlab.example.com/a/b/raw/blob/c.yaml',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a//blob/blob/c.yaml',
        result: 'https://gitlab.example.com/a/blob/raw/c.yaml',
      },
    ])('should handle happy path %#', async ({ config, url, result }) => {
      await expect(getGitLabFileFetchUrl(url, config)).resolves.toBe(result);
    });
  });

  describe('getGitLabFileFetchUrl with .yml extension', () => {
    it.each([
      // Project URLs
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yml/raw?ref=branch',
      },
      {
        config: configSelfHosteWithRelativePath,
        url: 'https://gitlab.mycompany.com/gitlab/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yml',
        result:
          'https://gitlab.mycompany.com/gitlab/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yml/raw?ref=branch',
      },
      {
        config: configSelfHostedWithoutRelativePath,
        url: 'https://gitlab.mycompany.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file.yml',
        result:
          'https://gitlab.mycompany.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile.yml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        // Works with non URI encoded link
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yml/raw?ref=branch',
      },
      {
        config: configSelfHosteWithRelativePath,
        // Works with non URI encoded link
        url: 'https://gitlab.mycompany.com/gitlab/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yml',
        result:
          'https://gitlab.mycompany.com/gitlab/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yml/raw?ref=branch',
      },
      {
        config: configSelfHostedWithoutRelativePath,
        // Works with non URI encoded link
        url: 'https://gitlab.mycompany.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path/to/file with spaces.yml',
        result:
          'https://gitlab.mycompany.com/api/v4/projects/12345/repository/files/my%2Fpath%2Fto%2Ffile%20with%20spaces.yml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yml',
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yml/raw?ref=branch',
      },
      {
        config: configWithToken,
        url: 'https://gitlab.example.com/groupA/teams/teamA/subgroupA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yml',
        result:
          'https://gitlab.example.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yml/raw?ref=branch',
      },
      {
        config: configWithNoToken,
        url: 'https://gitlab.com/groupA/teams/teamA/repoA/-/blob/branch/my/path%20with%20spaces/to/file.yml', // Repo not in subgroup
        result:
          'https://gitlab.com/api/v4/projects/12345/repository/files/my%2Fpath%20with%20spaces%2Fto%2Ffile.yml/raw?ref=branch',
      },
      // Raw URLs
      {
        config: configWithNoToken,
        url: 'https://gitlab.example.com/a/b/blob/master/c.yml',
        result: 'https://gitlab.example.com/a/b/raw/master/c.yml',
      },
    ])('should handle happy path %#', async ({ config, url, result }) => {
      await expect(getGitLabFileFetchUrl(url, config)).resolves.toBe(result);
    });
  });
});
