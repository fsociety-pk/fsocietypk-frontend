import '../../styles/password-strength-robot.css';

export type PasswordCheckState = 'empty' | 'weak' | 'fair' | 'good' | 'complete' | 'invalid';

const descriptions: Record<PasswordCheckState, string> = {
  empty: 'Waiting for a password', weak: 'More password checks needed',
  fair: 'Three password checks passed', good: 'Four password checks passed',
  complete: 'All five password checks passed', invalid: 'Password exceeds the 72-byte limit',
};

/** This helper receives a result state only, never password text or length. */
export default function PasswordStrengthRobot({ strength }: { strength: PasswordCheckState }) {
  const worried = strength === 'weak' || strength === 'invalid';
  const happy = strength === 'complete';
  const mouth = worried ? 'M28 45 Q36 38 44 45' : happy ? 'M27 40 Q36 52 45 40' : strength === 'good' ? 'M29 42 Q36 48 43 42' : 'M30 43 H42';
  return <span className="password-strength-robot" data-strength={strength} role="img" aria-label={`Password helper: ${descriptions[strength]}`}>
    <svg key={strength} viewBox="0 0 72 80" width="54" height="60" aria-hidden="true" focusable="false">
      <path className="password-robot-joints" d="M36 18V10M17 62L9 67M55 62L63 67M27 72V76M45 72V76" />
      <circle className="password-robot-signal" cx="36" cy="7" r="3" />
      <rect className="password-robot-shell" x="20" y="54" width="32" height="19" rx="6" />
      <path className="password-robot-detail" d="M30 63H42" />
      <g className="password-robot-head">
        <rect className="password-robot-shell" x="10" y="18" width="52" height="39" rx="12" />
        <rect className="password-robot-screen" x="17" y="25" width="38" height="26" rx="7" />
        {happy ? <path className="password-robot-expression" d="M24 35L28 32L32 35M40 35L44 32L48 35" /> : <>
          <rect className="password-robot-eye" x="25" y="32" width="5" height={worried ? 5 : 7} rx="2" />
          <rect className="password-robot-eye" x="42" y="32" width="5" height={worried ? 5 : 7} rx="2" />
          {worried && <path className="password-robot-brows" d="M24 29L31 27M41 27L48 29" />}
        </>}
        <path className="password-robot-expression password-robot-mouth" d={mouth} />
      </g>
    </svg>
  </span>;
}
