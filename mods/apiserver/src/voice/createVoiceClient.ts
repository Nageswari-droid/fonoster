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
import { getLogger } from "@fonoster/logger";
import { createGetChannelVar } from "./createGetChannelVar";
import {
  Channel,
  ChannelVar,
  StasisStartEvent,
  VoiceClient,
  VoiceClientConfig
} from "./types";
import { VoiceClientImpl } from "./VoiceClientImpl";

type FonosterSDK = {
  createAppToken: (ref: string) => Promise<string>;
  getApp: (
    ref: string
  ) => Promise<{ ref: string; accessKeyId: string; endpoint: string }>;
};

const logger = getLogger({ service: "apiserver", filePath: __filename });

// Note: By the time the all arrives here the owner of the app MUST be authenticated
function createVoiceClient(sdk: FonosterSDK) {
  return async (
    event: StasisStartEvent,
    channel: Channel
  ): Promise<VoiceClient> => {
    const { id: sessionRef, caller } = event.channel;
    const { name: callerName, number: callerNumber } = caller;

    const getChannelVar = createGetChannelVar(channel);

    // Variables set by Asterisk's dialplan
    const ingressNumber =
      (await getChannelVar(ChannelVar.INGRESS_NUMBER))?.value || "";
    const metadataStr = (await getChannelVar(ChannelVar.METADATA))?.value;
    const appRef = (await getChannelVar(ChannelVar.APP_REF))?.value;

    // TODO: Should fail if appRef is not set
    const { accessKeyId, endpoint } = await sdk.getApp(appRef);
    const sessionToken = await sdk.createAppToken(appRef);

    const config: VoiceClientConfig = {
      appRef,
      sessionRef,
      accessKeyId,
      endpoint,
      callerName,
      callerNumber,
      ingressNumber,
      sessionToken,
      metadata: metadataStr ? JSON.parse(metadataStr) : {}
    };

    logger.verbose("creating voice client with config: ", {
      callerNumber,
      ingressNumber
    });

    return new VoiceClientImpl(config);
  };
}

export { createVoiceClient };