/*
 * Copyright (C) 2024 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/fonoster
 *
 * This file is part of Fonoster
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { WorkspaceConfig } from "./types";

function addWorkspace(
  config: WorkspaceConfig,
  workspaces: WorkspaceConfig[]
): WorkspaceConfig[] {
  const workspaceIndex = workspaces.findIndex(
    (workspace) => workspace.workspaceRef === config.workspaceRef
  );

  if (workspaceIndex === -1) {
    return workspaces.concat({ ...config, active: true });
  }

  workspaces[workspaceIndex] = { ...config, active: true };
}

export { addWorkspace };