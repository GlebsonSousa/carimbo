package expo.modules.carimbobubble

import android.animation.ValueAnimator
import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.provider.Settings
import android.view.Gravity
import android.view.MotionEvent
import android.view.ViewConfiguration
import android.view.WindowManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import kotlin.math.abs
import kotlin.math.hypot

/**
 * Serviço que mantém a bolha flutuante na tela, por cima de qualquer app.
 * Toque na bolha: abre o Carimbo (carimbo://bubble) com os atalhos flutuando.
 * Arraste: move a bolha, que gruda na borda mais próxima ao soltar.
 */
class BubbleService : Service() {
  companion object {
    @Volatile var running = false
    private const val CHANNEL_ID = "carimbo_bubble"
    private const val NOTIFICATION_ID = 4417
    const val ACTION_STOP = "expo.modules.carimbobubble.STOP"
  }

  private var windowManager: WindowManager? = null
  private var bubble: BubbleView? = null
  private lateinit var params: WindowManager.LayoutParams

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      stopSelf()
      return START_NOT_STICKY
    }
    startAsForeground()
    if (bubble == null && Settings.canDrawOverlays(this)) addBubble()
    running = bubble != null
    if (!running) stopSelf()
    return START_STICKY
  }

  override fun onDestroy() {
    bubble?.let { view -> runCatching { windowManager?.removeView(view) } }
    bubble = null
    running = false
    super.onDestroy()
  }

  private fun startAsForeground() {
    val manager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(CHANNEL_ID, "Bolha flutuante", NotificationManager.IMPORTANCE_MIN)
      channel.setShowBadge(false)
      manager.createNotificationChannel(channel)
    }
    val immutable = PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
    val stopIntent = PendingIntent.getService(
      this, 1, Intent(this, BubbleService::class.java).setAction(ACTION_STOP), immutable
    )
    val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(R.drawable.carimbo_bubble_notification)
      .setContentTitle("Bolha do Carimbo ativa")
      .setContentText("Toque na bolha para converter um arquivo.")
      .setOngoing(true)
      .setPriority(NotificationCompat.PRIORITY_MIN)
      .setContentIntent(launchIntent(0))
      .addAction(0, "Desligar bolha", stopIntent)
      .build()
    val type = if (Build.VERSION.SDK_INT >= 34) ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE else 0
    ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, type)
  }

  private fun launchIntent(requestCode: Int): PendingIntent {
    val intent = openAppIntent()
    return PendingIntent.getActivity(this, requestCode, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  private fun openAppIntent(): Intent =
    Intent(Intent.ACTION_VIEW, Uri.parse("carimbo://bubble?t=" + System.currentTimeMillis()))
      .setPackage(packageName)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

  @SuppressLint("ClickableViewAccessibility")
  private fun addBubble() {
    val wm = getSystemService(WINDOW_SERVICE) as WindowManager
    val density = resources.displayMetrics.density
    val size = (64 * density).toInt()
    val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }
    params = WindowManager.LayoutParams(
      size, size, overlayType,
      WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
      PixelFormat.TRANSLUCENT
    ).apply {
      gravity = Gravity.TOP or Gravity.START
      x = resources.displayMetrics.widthPixels - size
      y = (resources.displayMetrics.heightPixels * 0.55f).toInt()
    }

    val view = BubbleView(this)
    val slop = ViewConfiguration.get(this).scaledTouchSlop
    var downX = 0f
    var downY = 0f
    var startX = 0
    var startY = 0
    var dragging = false

    view.setOnTouchListener { v, event ->
      when (event.actionMasked) {
        MotionEvent.ACTION_DOWN -> {
          downX = event.rawX
          downY = event.rawY
          startX = params.x
          startY = params.y
          dragging = false
          v.animate().scaleX(0.92f).scaleY(0.92f).setDuration(90).start()
          true
        }
        MotionEvent.ACTION_MOVE -> {
          val dx = event.rawX - downX
          val dy = event.rawY - downY
          if (!dragging && hypot(dx, dy) > slop) dragging = true
          if (dragging) {
            params.x = startX + dx.toInt()
            params.y = startY + dy.toInt()
            runCatching { wm.updateViewLayout(v, params) }
          }
          true
        }
        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
          v.animate().scaleX(1f).scaleY(1f).setDuration(120).start()
          if (dragging) {
            snapToEdge(wm, v.width)
          } else if (event.actionMasked == MotionEvent.ACTION_UP) {
            v.performClick()
            startActivity(openAppIntent())
          }
          true
        }
        else -> false
      }
    }

    wm.addView(view, params)
    windowManager = wm
    bubble = view
  }

  private fun snapToEdge(wm: WindowManager, viewWidth: Int) {
    val screenW = resources.displayMetrics.widthPixels
    val screenH = resources.displayMetrics.heightPixels
    val target = if (params.x + viewWidth / 2 < screenW / 2) 0 else screenW - viewWidth
    params.y = params.y.coerceIn(0, maxOf(0, screenH - viewWidth))
    ValueAnimator.ofInt(params.x, target).apply {
      duration = (180 + abs(target - params.x) / 6).toLong().coerceAtMost(320)
      addUpdateListener { anim ->
        params.x = anim.animatedValue as Int
        bubble?.let { runCatching { wm.updateViewLayout(it, params) } }
      }
      start()
    }
  }
}
