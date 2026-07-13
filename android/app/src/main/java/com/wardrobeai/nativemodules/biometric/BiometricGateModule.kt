package com.wardrobeai.nativemodules.biometric

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.wardrobeai.nativemodules.NativeBiometricGateSpec

private const val ALLOWED_AUTHENTICATORS = BIOMETRIC_WEAK or DEVICE_CREDENTIAL

/**
 * Wraps AndroidX Biometric (requirements.md 1.1). BIOMETRIC_WEAK |
 * DEVICE_CREDENTIAL is requested together so BiometricPrompt itself falls
 * back to the device's own PIN/pattern/password UI whenever biometric
 * hardware is absent or unenrolled — there is no separate fallback UI to
 * build (requirements.md's "No-biometric-hardware fallback" decision).
 */
@ReactModule(name = BiometricGateModule.NAME)
class BiometricGateModule(reactContext: ReactApplicationContext) :
  NativeBiometricGateSpec(reactContext) {

  override fun getName() = NAME

  override fun checkAvailability(promise: Promise) {
    val manager = BiometricManager.from(reactApplicationContext)
    val status =
      when (manager.canAuthenticate(ALLOWED_AUTHENTICATORS)) {
        BiometricManager.BIOMETRIC_SUCCESS -> "available"
        BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> "no_hardware"
        BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> "not_enrolled"
        else -> "unavailable"
      }
    promise.resolve(Arguments.createMap().apply { putString("status", status) })
  }

  override fun authenticate(promptTitle: String, promptSubtitle: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity as? FragmentActivity
    if (activity == null) {
      promise.resolve(errorResult("No foreground activity to host the biometric prompt."))
      return
    }

    activity.runOnUiThread {
      val callback =
        object : BiometricPrompt.AuthenticationCallback() {
          override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            promise.resolve(successResult())
          }

          override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
            val status =
              if (
                errorCode == BiometricPrompt.ERROR_USER_CANCELED ||
                errorCode == BiometricPrompt.ERROR_CANCELED ||
                errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON
              ) {
                "cancelled"
              } else {
                "error"
              }
            promise.resolve(errorResult(errString.toString(), status))
          }

          // A single rejected attempt (e.g. wrong fingerprint) — BiometricPrompt
          // keeps its sheet open for retry, so this deliberately does not
          // resolve the promise; onAuthenticationError/Succeeded is the only
          // terminal outcome.
          override fun onAuthenticationFailed() = Unit
        }

      val prompt = BiometricPrompt(activity, ContextCompat.getMainExecutor(activity), callback)
      val promptInfo =
        BiometricPrompt.PromptInfo.Builder()
          .setTitle(promptTitle)
          .setSubtitle(promptSubtitle)
          .setAllowedAuthenticators(ALLOWED_AUTHENTICATORS)
          // Illegal to combine with DEVICE_CREDENTIAL in setAllowedAuthenticators
          // (throws IllegalArgumentException) — the system supplies its own
          // dismiss affordance instead.
          .build()

      prompt.authenticate(promptInfo)
    }
  }

  private fun successResult(): WritableMap =
    Arguments.createMap().apply {
      putString("status", "success")
      putString("errorMessage", "")
    }

  private fun errorResult(message: String, status: String = "error"): WritableMap =
    Arguments.createMap().apply {
      putString("status", status)
      putString("errorMessage", message)
    }

  companion object {
    const val NAME = "BiometricGate"
  }
}
