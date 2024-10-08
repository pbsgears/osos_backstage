/*
 * Copyright 2021 The Backstage Authors
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
import React from 'react';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { Select, SelectItem } from '@backstage/core-components';
import { RepoUrlPickerState } from './types';

export const BitbucketRepoPicker = (props: {
  allowedOwners?: string[];
  onChange: (state: RepoUrlPickerState) => void;
  state: RepoUrlPickerState;
  rawErrors: string[];
}) => {
  const { allowedOwners = [], onChange, rawErrors, state } = props;
  const { host, workspace, project } = state;
  const ownerItems: SelectItem[] = allowedOwners
    ? allowedOwners?.map(i => ({ label: i, value: i }))
    : [];
  return (
    <>
      {host === 'bitbucket.org' && (
        <FormControl
          margin="normal"
          required
          error={rawErrors?.length > 0 && !workspace}
        >
          {allowedOwners?.length ? (
            <Select
              native
              label="Allowed Workspaces"
              onChange={s =>
                onChange({ workspace: String(Array.isArray(s) ? s[0] : s) })
              }
              disabled={allowedOwners.length === 1}
              selected={workspace}
              items={ownerItems}
            />
          ) : (
            <>
              <InputLabel htmlFor="workspaceInput">Workspace</InputLabel>
              <Input
                id="workspaceInput"
                onChange={e => onChange({ workspace: e.target.value })}
                value={workspace}
              />
            </>
          )}
          <FormHelperText>
            The Organization that this repo will belong to
          </FormHelperText>
        </FormControl>
      )}
      <FormControl
        margin="normal"
        required
        error={rawErrors?.length > 0 && !project}
      >
        <InputLabel htmlFor="projectInput">Project</InputLabel>
        <Input
          id="projectInput"
          onChange={e => onChange({ project: e.target.value })}
          value={project}
        />
        <FormHelperText>
          The Project that this repo will belong to
        </FormHelperText>
      </FormControl>
    </>
  );
};
