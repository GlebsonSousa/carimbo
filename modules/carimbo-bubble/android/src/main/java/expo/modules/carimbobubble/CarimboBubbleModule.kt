package expo.modules.carimbobubble

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.core.content.ContextCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Ponte entre o JavaScript e a bolha flutuante (BubbleService). */
class CarimboBubbleModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context indisponível" }

  override fun definition() = ModuleDefinition {
    Name("CarimboBubble")

    Function("canDrawOverlays") {
      Settings.canDrawOverlays(context)
    }

    Function("openOverlaySettings") {
      val intent = Intent(
        Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
        Uri.parse("package:" + context.packageName)
      ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    Function("start") {
      if (!Settings.canDrawOverlays(context)) {
        false
      } else {
        ContextCompat.startForegroundService(context, Intent(context, BubbleService::class.java))
        true
      }
    }

    Function("stop") {
      context.stopService(Intent(context, BubbleService::class.java))
      Unit
    }

    Function("isRunning") {
      BubbleService.running
    }
  }
}
