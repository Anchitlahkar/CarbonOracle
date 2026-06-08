import { Result } from '@carbonsense/core';
import { UserProfile, CarbonEntry, CarbonDNAProfile } from '@carbonsense/shared-types';

export interface CarbonDNAEngine {
  /**
   * Evaluates user's history and lifestyle data to assemble a customized CarbonDNAProfile.
   */
  generateDNAProfile(profile: UserProfile, entries: CarbonEntry[]): Result<CarbonDNAProfile>;

  /**
   * Assigns a specific behavioral carbon category title/persona mapping (e.g. 'Eco Enthusiast').
   */
  classifyUser(profile: UserProfile, entries: CarbonEntry[]): Result<string>;
}
