import React from "react";
import { Composition } from "remotion";
import { Demo, DEMO_SECONDS } from "./Demo";
import { EditData, EditVideo } from "./EditVideo";
import edit from "./edit.json";
import { FPS, H, W } from "./theme";

const data = edit as unknown as EditData;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="StyleDemo" component={Demo} durationInFrames={DEMO_SECONDS * FPS} fps={FPS} width={W} height={H} />
    <Composition
      id="Library"
      component={EditVideo}
      defaultProps={{ data }}
      durationInFrames={Math.round(data.duration * data.fps)}
      fps={data.fps}
      width={W}
      height={H}
    />
  </>
);
