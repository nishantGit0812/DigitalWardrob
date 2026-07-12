package com.wardrobeai.nativemodules.profilepin

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.wardrobeai.nativemodules.NativeProfilePinSpec
import org.mindrot.jbcrypt.BCrypt

private const val PREFS_FILE_NAME = "profile_pins"

/**
 * bcrypt-hashes and verifies per-profile PINs (requirements.md 1.7-1.9).
 * Hashes are stored via Keystore-backed EncryptedSharedPreferences rather
 * than plain MMKV (spec.md §26 Security Strategy) — the plaintext PIN
 * itself is never persisted, logged, or included in a rejected promise's
 * error message.
 */
@ReactModule(name = ProfilePinModule.NAME)
class ProfilePinModule(reactContext: ReactApplicationContext) :
  NativeProfilePinSpec(reactContext) {

  override fun getName() = NAME

  private val preferences: SharedPreferences by lazy {
    val context: Context = reactApplicationContext.applicationContext
    val masterKey =
      MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build()

    EncryptedSharedPreferences.create(
      context,
      PREFS_FILE_NAME,
      masterKey,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )
  }

  override fun setPin(profileId: String, pin: String, promise: Promise) {
    try {
      // BCrypt.gensalt() produces a fresh random salt per call — "bcrypt-hash
      // with a per-profile salt" (plan.md 5.1) falls out naturally since
      // bcrypt embeds the salt in its own hash string format, no separate
      // salt storage/management needed.
      val hash = BCrypt.hashpw(pin, BCrypt.gensalt())
      preferences.edit().putString(profileId, hash).apply()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("PROFILE_PIN_SET_FAILED", "Could not save the PIN.")
    }
  }

  override fun verifyPin(profileId: String, pin: String, promise: Promise) {
    try {
      val storedHash = preferences.getString(profileId, null)
      promise.resolve(storedHash != null && BCrypt.checkpw(pin, storedHash))
    } catch (error: Exception) {
      promise.reject("PROFILE_PIN_VERIFY_FAILED", "Could not verify the PIN.")
    }
  }

  override fun hasPin(profileId: String, promise: Promise) {
    promise.resolve(preferences.contains(profileId))
  }

  override fun clearPin(profileId: String, promise: Promise) {
    preferences.edit().remove(profileId).apply()
    promise.resolve(null)
  }

  companion object {
    const val NAME = "ProfilePin"
  }
}
