import { useId } from 'react';

/** Local illustration of the Yeonnam street grid; no external map tiles or API key. */
export function MapBackdrop() {
  const patternId = useId();
  return <svg viewBox="0 0 360 740" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id={patternId} width="76" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-34 180 320)">
        <rect width="76" height="100" fill="#f4f3ef" />
        <g stroke="#e3e1da" strokeWidth="1">
          <path d="M7 7h24v27H7zM36 7h27v17H36zM36 29h27v20H36zM7 40h24v17H7zM7 63h24v25H7zM36 56h27v32H36z" fill="#f7eade" />
          <path d="M0 95H76M70 0V100" stroke="white" strokeWidth="8" />
        </g>
      </pattern>
    </defs>
    <rect width="360" height="740" fill={`url(#${patternId})`} />
    <path d="M-30 570C60 482 66 353 170 280S280 118 390 72" fill="none" stroke="#e0e6d2" strokeWidth="45" />
    <path d="M-30 570C60 482 66 353 170 280S280 118 390 72" fill="none" stroke="#cbd8b8" strokeWidth="27" />
    <g fill="none" stroke="#dedbd2" strokeWidth="19">
      <path d="M-40 89L389 535M-35 340L333 739M-20 658L393 204M65 -20L393 333" />
    </g>
    <g fill="none" stroke="#fff" strokeWidth="15">
      <path d="M-40 89L389 535M-35 340L333 739M-20 658L393 204M65 -20L393 333" />
    </g>
    <g fontSize="10" fill="#aaa69e" fontFamily="inherit" textAnchor="middle">
      <text x="93" y="165" transform="rotate(46 93 165)">동교로</text>
      <text x="275" y="344" transform="rotate(46 275 344)">성미산로</text>
      <text x="90" y="544" transform="rotate(-47 90 544)">연희로</text>
      <text x="259" y="81">연남동</text>
    </g>
    <g fontSize="9" fill="#aaa396" fontFamily="inherit">
      <text x="17" y="250">작은 서점</text><text x="251" y="183">골목 식당</text>
      <text x="191" y="431">연남 산책길</text><text x="37" y="475">동네 꽃집</text>
    </g>
    <text x="165" y="251" fontSize="10" fill="#849671" transform="rotate(-47 165 251)" fontFamily="inherit">경의선숲길</text>
  </svg>;
}
