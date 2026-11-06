import { identity } from '../../app/dependencies.js';
import { FinancingRepository } from './FinancingRepository.js';
export function financingStore() {
  return new FinancingRepository(window.localStorage, identity.getSession()?.user?.id);
}
