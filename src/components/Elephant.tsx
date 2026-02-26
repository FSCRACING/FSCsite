import React from "react";

export default function Elephant() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
      <g id="elephant" transform="translate(135 0) scale(1.388)">
        <style>
          {`
            .st0{fill:#737373;}
            .st1{fill:#FFFFFF;stroke:#FFFFFF;stroke-miterlimit:10;}
            .st2{fill:#FFFFFF;}
            .st3{fill:none;}
          `}
        </style>

        {/* ✅ placeholder “elephant body” (swap col tuo path completo quando vuoi) */}
        <g>
          <path
            className="st0"
            d="M97.3,111.9c0,53.4-44,97.3-97.3,97.3V14.6C53.4,14.6,97.3,58.5,97.3,111.9z"
          />
          <path
            className="st0"
            d="M0,374.5V223.4c11.9,0.2,23.8-1.5,35.2-5.2c29.5-9.7,46-29.7,51.4-36.4c2.3-2.9,3.9-5,4.5-5.9
               c12.5-18,19.5-39.3,20.1-61.2c0.1-19.6-4.8-38.9-14.3-56.1c-6.3-11.6-14.7-22.1-24.6-30.8"
          />
        </g>

        {/* ✅ RUOTA identica come hook/ids */}
        <g id="wheelBase">
          <g id="wheelClick">
            <image href="/wheel.png" x="0" y="20" width="270" height="270" />
          </g>
        </g>
      </g>
    </svg>
  );
}
