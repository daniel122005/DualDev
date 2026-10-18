import type { Screen } from '../App'

const correctCode = `public class Ejercicio {
    public static void main(String[] args) {
        int suma = 0;
        for (int i = 1; i <= 10; i++) {
            suma += i;
        }
        System.out.println("Suma = " + suma);
    }
}`

const userCode = `public class Ejercicio {
    public static void main(String[] args) {
        int suma = 0;
        for (int i = 1; i <= 10; i++) {
            suma = suma + i;
        }
        System.out.println("Suma = " + suma)
    }
}`

export default function FeedbackScreen({
  correct, navigate,
}: { correct: boolean; navigate: (s: Screen) => void }) {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Result banner */}
      <div
        className="rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
        style={{
          background: correct
            ? 'linear-gradient(135deg, rgba(22,163,74,0.14), rgba(22,163,74,0.05))'
            : 'linear-gradient(135deg, rgba(251,113,133,0.14), rgba(251,113,133,0.05))',
          border: `2px solid ${correct ? 'rgba(30,212,138,0.5)' : 'rgba(251,113,133,0.5)'}`,
        }}
      >
        <div style={{
          position: 'absolute', top: -60, right: -60, width: 200, height: 200,
          background: `radial-gradient(circle, ${correct ? 'rgba(30,212,138,0.2)' : 'rgba(251,113,133,0.2)'} 0%, transparent 70%)`,
        }} />
        <div className="relative z-10">
          <div style={{ fontSize: 64, marginBottom: 8 }}>{correct ? '🎉' : '😅'}</div>
          <h2
            className="font-display font-black text-3xl mb-2"
            style={{ color: correct ? '#1ed48a' : '#fb7185' }}
          >
            {correct ? '¡Correcto!' : 'Casi lo logras'}
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
            {correct
              ? 'Tu solución es correcta y bien estructurada. ¡Sigue así!'
              : 'Revisa los errores y vuelve a intentarlo. ¡Tú puedes!'}
          </p>
          {correct && (
            <div className="flex justify-center gap-4 mt-4">
              {[
                { icon: '⚡', label: 'XP ganados', val: '+40 XP', color: '#fbbf24' },
                { icon: '🎯', label: 'Precisión',  val: '100%',   color: '#1ed48a' },
                { icon: '⏱', label: 'Tiempo',     val: '3:24',   color: '#7af0b4' },
              ].map((s) => (
                <div key={s.label} className="px-4 py-2 rounded-xl" style={{ background: `${s.color}18`, border: `1px solid ${s.color}44` }}>
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{s.icon} {s.label}</p>
                  <p className="font-display font-black text-lg" style={{ color: s.color }}>{s.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!correct && (
        <>
          <div className="card-border p-5 mb-4" style={{ borderColor: 'rgba(251,113,133,0.35)' }}>
            <p className="font-display font-bold text-sm mb-3" style={{ color: '#fb7185' }}>❌ Errores encontrados</p>
            <div
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)' }}
            >
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold flex-shrink-0" style={{ background: 'rgba(251,113,133,0.2)', color: '#fb7185' }}>
                L.7
              </span>
              <div>
                <p className="text-xs font-bold mb-0.5" style={{ color: '#fb7185' }}>Sintaxis</p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Falta punto y coma ";" al final de println</p>
              </div>
            </div>
          </div>

          <div className="card-border p-4 mb-4" style={{ borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)' }}>
            <p className="font-display font-bold text-sm mb-2" style={{ color: '#fbbf24' }}>💡 Recomendación</p>
            <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
              En Java, <strong>todas las sentencias deben terminar con ";"</strong>.
              Revisa la línea 7: la llamada a{' '}
              <code className="font-mono text-xs px-1 rounded" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>System.out.println()</code>
              {' '}le falta el punto y coma al final.
            </p>
          </div>
        </>
      )}

      {/* Code comparison */}
      <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: correct ? '1fr' : '1fr 1fr' }}>
        {!correct && (
          <div>
            <p className="text-xs font-display font-bold mb-2" style={{ color: 'var(--color-muted)' }}>TU CÓDIGO</p>
            <div className="code-block" style={{ borderColor: 'rgba(251,113,133,0.3)' }}>
              {userCode.split('\n').map((line, i) => (
                <div key={i} className="flex gap-2"
                  style={{ background: i === 6 ? 'rgba(251,113,133,0.12)' : 'transparent', borderRadius: 4, margin: '1px 0' }}>
                  <span className="select-none" style={{ color: i === 6 ? '#fb7185' : 'var(--color-border)', minWidth: 20, fontSize: 11 }}>{i + 1}</span>
                  <span style={{ color: i === 6 ? '#fb7185' : undefined }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-display font-bold mb-2" style={{ color: '#1ed48a' }}>
            {correct ? 'TU SOLUCIÓN ✓' : 'SOLUCIÓN CORRECTA'}
          </p>
          <div className="code-block" style={{ borderColor: 'rgba(30,212,138,0.3)' }}>
            {correctCode.split('\n').map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="select-none" style={{ color: 'var(--color-border)', minWidth: 20, fontSize: 11 }}>{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {correct && (
        <div className="card-border p-4 mb-5" style={{ borderColor: 'rgba(30,212,138,0.3)', background: 'rgba(30,212,138,0.06)' }}>
          <p className="font-display font-bold text-sm mb-2" style={{ color: '#7af0b4' }}>📚 ¿Sabías que...?</p>
          <p className="text-sm" style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>
            También puedes escribir <code className="font-mono text-xs px-1 rounded" style={{ background: 'rgba(30,212,138,0.15)', color: '#7af0b4' }}>suma += i</code>{' '}
            en lugar de <code className="font-mono text-xs px-1 rounded" style={{ background: 'rgba(30,212,138,0.15)', color: '#7af0b4' }}>suma = suma + i</code>.
            Ambas formas son correctas. La primera es más compacta.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          className="flex-1 py-3 rounded-xl text-sm font-display font-bold"
          style={{ background: 'var(--color-card2)', border: '1px solid var(--color-border)', cursor: 'pointer', color: 'var(--color-muted)' }}
          onClick={() => navigate('practice')}
        >
          {correct ? '← Más ejercicios' : '↺ Intentar de nuevo'}
        </button>
        <button
          className={correct ? 'btn-primary flex-1 py-3 text-sm' : 'btn-lime flex-1 py-3 text-sm'}
          onClick={() => navigate(correct ? 'lesson' : 'practice')}
        >
          {correct ? 'Siguiente lección →' : 'Ver pista →'}
        </button>
      </div>
    </div>
  )
}
