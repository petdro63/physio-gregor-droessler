import type { Exercise } from './types';

/** Original, schematic poses drawn from the supplied blue-shirt/orange-shorts style reference.
 *  The elbows are flexed at ~90 degrees in BOTH phases, especially in the raised U-hold.
 */
export const shoulderRotationIds = [
  'schulter-aussenrotation-stand',
  'schulter-aussenrotation-sitz',
  'schulter-aussenrotation-u-halte-sitz'
] as const;

export function isShoulderRotationExercise(id: string) {
  return shoulderRotationIds.some(value => value === id);
}

export function ShoulderRotationArt({ exercise, phase = 0 }: { exercise: Exercise; phase?: number }) {
  const raised = exercise.id === 'schulter-aussenrotation-u-halte-sitz';
  const seated = exercise.id !== 'schulter-aussenrotation-stand';
  const finish = phase > 0;
  const name = raised ? 'Schulteraußenrotation auf Schulterhöhe' : 'Schulteraußenrotation am Körper';
  const description = raised
    ? (finish
      ? 'Oberarme und Ellenbogen seitlich auf Schulterhöhe, Ellenbogen 90 Grad gebeugt, Unterarme nach oben in U-Halte gedreht.'
      : 'Oberarme seitlich auf Schulterhöhe, Ellenbogen bereits 90 Grad gebeugt, beide Unterarme zeigen nach vorne zum Betrachter.')
    : (finish
      ? 'Ellenbogen bleiben gebeugt am Rumpf, Unterarme sind seitlich nach außen gedreht.'
      : 'Ellenbogen bleiben 90 Grad gebeugt am Rumpf, Unterarme zeigen nach vorne.');

  return (
    <svg className="reference-pose" width="100%" viewBox="0 0 460 330" role="img"
      aria-label={name + ': ' + (finish ? 'Endstellung. ' : 'Ausgangsstellung. ') + description}
      xmlns="http://www.w3.org/2000/svg">
      <rect width="460" height="330" rx="12" fill="#f9fbfe" />
      <ellipse cx="230" cy="309" rx="110" ry="12" fill="#e5eaf0" />
      {seated && <g fill="none" stroke="#394452" strokeWidth="7" strokeLinecap="round">
        <path d="M191 208h78 M199 217v88 M261 217v88 M200 290h61" />
        <path d="M262 208v-39" />
      </g>}
      {!seated ? (
        <g strokeLinecap="round" fill="none">
          <path d="M212 214L205 283M248 214L255 283" stroke="#ffaf7d" strokeWidth="24" />
          <path d="M205 283L199 300M255 283L261 300" stroke="#ffaf7d" strokeWidth="12" />
          <path d="M199 300h-31M261 300h31" stroke="#1c6ac0" strokeWidth="15" />
        </g>
      ) : (
        <g strokeLinecap="round" fill="none">
          <path d="M210 215L178 224L178 266M250 215L282 224L282 266" stroke="#ffaf7d" strokeWidth="24" />
          <path d="M178 266L176 293M282 266L284 293" stroke="#ffaf7d" strokeWidth="12" />
          <path d="M176 295h-32M284 295h32" stroke="#1c6ac0" strokeWidth="14" />
        </g>
      )}
      <path d="M204 201H256L260 229H200Z" fill="#fa803a" />
      <path d="M206 95Q230 86 254 95L269 203Q230 215 191 203Z" fill="#168bd6" />
      <path d="M220 79H240V100H220Z" fill="#f5aa7d"/>
      <ellipse cx="230" cy="55" rx="31" ry="37" fill="#ffb184"/>
      <path d="M201 58Q192 23 214 18Q216 7 232 12Q251 6 258 24Q274 28 260 59L253 40Q231 51 208 39Z" fill="#75442f"/>
      <g fill="#75442f">
        <circle cx="202" cy="32" r="10"/><circle cx="215" cy="23" r="12"/>
        <circle cx="234" cy="19" r="13"/><circle cx="253" cy="29" r="11"/>
      </g>
      <g fill="#303c52"><circle cx="218" cy="55" r="2.6"/><circle cx="242" cy="55" r="2.6"/></g>
      <path d="M223 68Q230 74 237 68" fill="none" stroke="#a64b45" strokeWidth="2.2" strokeLinecap="round"/>
      {raised ? (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* The upper arms stay horizontal. The elbow joint is a visible 90-degree BEND in BOTH images. */}
          <path d="M203 119H145M257 119H315" stroke="#168bd6" strokeWidth="21"/>
          {finish ? (
            <>
              <path d="M145 119V53M315 119V53" stroke="#ffad79" strokeWidth="16"/>
              <path d="M145 53v-13M315 53v-13" stroke="#ffad79" strokeWidth="18"/>
              <path d="M116 111Q99 86 120 66M344 111Q361 86 340 66" stroke="#23975c" strokeWidth="4"/>
              <path d="M120 66l-10 7 13 2M340 66l10 7-13 2" stroke="#23975c" strokeWidth="4"/>
            </>
          ) : (
            <>
              {/* Forearms are directed toward the viewer; their projected length is shortened
                  to show depth, NOT extended sideways. Elbows remain bent by ~90°. */}
              <path d="M145 119L160 153M315 119L300 153" stroke="#ffad79" strokeWidth="18"/>
              <ellipse cx="162" cy="154" rx="15" ry="18" fill="#ffb487" stroke="#e68e60" strokeWidth="2"/>
              <ellipse cx="298" cy="154" rx="15" ry="18" fill="#ffb487" stroke="#e68e60" strokeWidth="2"/>
              <path d="M180 159L165 149M280 159L295 149" stroke="#bdd4eb" strokeWidth="2" strokeDasharray="4 5"/>
            </>
          )}
          <circle cx="145" cy="119" r="8" fill="#f6a372"/>
          <circle cx="315" cy="119" r="8" fill="#f6a372"/>
        </g>
      ) : (
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M198 119L187 163M262 119L273 163" stroke="#168bd6" strokeWidth="23"/>
          <path d={finish ? 'M187 163L119 166M273 163L341 166' : 'M187 163L220 174M273 163L240 174'}
            stroke="#ffaf7d" strokeWidth="16"/>
          <circle cx="187" cy="163" r="8" fill="#f6a372"/>
          <circle cx="273" cy="163" r="8" fill="#f6a372"/>
          {finish ? (
            <>
              <path d="M139 205Q117 198 117 181M321 205Q343 198 343 181" stroke="#23975c" strokeWidth="4"/>
              <path d="M117 181l-9 10 13 1M343 181l9 10-13 1" stroke="#23975c" strokeWidth="4"/>
            </>
          ) : null}
        </g>
      )}
      <text x="230" y="323" textAnchor="middle" fontSize="10" fill="#546a85">
        {raised ? 'Ellenbogen in beiden Positionen etwa 90° gebeugt' : 'Ellenbogen seitlich am Körper lassen'}
      </text>
    </svg>
  );
}
