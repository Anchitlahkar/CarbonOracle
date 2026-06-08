import { Result } from '@carbonsense/core';
import { CarbonEntry, SimulationState } from '@carbonsense/shared-types';

export interface PlanetTwinEngine {
  /**
   * Calculates the projected planetary simulation state based on the user's carbon inputs and current baseline.
   */
  simulateState(entries: CarbonEntry[], currentState: SimulationState): Result<SimulationState>;

  /**
   * Progression simulator for stepping the simulation state forward in time.
   */
  getProgressTime(days: number): Result<SimulationState>;
}
