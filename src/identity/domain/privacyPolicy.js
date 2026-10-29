export const PRIVACY_POLICY_VERSION = 'provisional-2026-10-28-v1';
export function validateDataConsent(consent) {
  return consent?.accepted === true && consent.policyVersion === PRIVACY_POLICY_VERSION;
}
