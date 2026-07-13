import type { ProfilePinGateway } from '../domain/profilePin';
import NativeProfilePin from './native/NativeProfilePin';

// Implements the profiles/domain ProfilePinGateway port against the
// `ProfilePin` TurboModule — the only place in the app allowed to import
// the codegen spec directly (tech-stack.md: native modules are reached
// only through Data's NativeBridge).
export class NativeProfilePinGateway implements ProfilePinGateway {
  setPin(profileId: string, pin: string): Promise<void> {
    return NativeProfilePin.setPin(profileId, pin);
  }

  verifyPin(profileId: string, pin: string): Promise<boolean> {
    return NativeProfilePin.verifyPin(profileId, pin);
  }

  hasPin(profileId: string): Promise<boolean> {
    return NativeProfilePin.hasPin(profileId);
  }

  clearPin(profileId: string): Promise<void> {
    return NativeProfilePin.clearPin(profileId);
  }
}
