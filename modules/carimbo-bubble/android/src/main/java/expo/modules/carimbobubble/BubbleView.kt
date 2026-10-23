package expo.modules.carimbobubble

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.view.View

/** A bolha: círculo laranja com o anel em fatias do Carimbo. */
class BubbleView(context: Context) : View(context) {
  private val density = resources.displayMetrics.density

  private val shadow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.argb(70, 27, 29, 42)
  }
  private val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.rgb(242, 100, 63)
  }
  private val halo = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    style = Paint.Style.STROKE
    strokeWidth = 3f * density
    color = Color.argb(72, 255, 255, 255)
  }
  private val ink = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    style = Paint.Style.STROKE
    strokeWidth = 3f * density
    strokeCap = Paint.Cap.ROUND
    color = Color.rgb(27, 29, 42)
  }
  private val dot = Paint(Paint.ANTI_ALIAS_FLAG).apply {
    color = Color.rgb(27, 29, 42)
  }
  private val ring = RectF()

  init {
    contentDescription = "Carimbo: converter arquivo"
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val cx = width / 2f
    val cy = height / 2f
    val r = minOf(width, height) / 2f - 4f * density

    canvas.drawCircle(cx, cy + 2f * density, r, shadow)
    canvas.drawCircle(cx, cy, r, fill)
    canvas.drawCircle(cx, cy, r - 2f * density, halo)

    val ringR = r * 0.48f
    ring.set(cx - ringR, cy - ringR, cx + ringR, cy + ringR)
    // Quatro fatias com vão entre elas, como a roda do app.
    for (i in 0 until 4) {
      canvas.drawArc(ring, -80f + i * 90f, 60f, false, ink)
    }
    canvas.drawCircle(cx, cy, r * 0.14f, dot)
  }
}
