import { CustomEdge } from './CustomEdge';
import { SmoothstepEdge } from './SmoothstepEdge';
import { StepEdge } from './StepEdge';
import type { EdgeTypes } from '@reactflow/core';

export { CustomEdge, SmoothstepEdge, StepEdge };

export const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
  smoothstep: SmoothstepEdge,
  step: StepEdge,
};
