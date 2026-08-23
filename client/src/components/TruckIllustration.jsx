const TruckIllustration = () => {
  return (
    <div className="truck-wrapper">

      <svg
        viewBox="0 0 900 500"
        className="truck-svg"
        xmlns="http://www.w3.org/2000/svg"
      >

        {/* CONTAINER */}

        <rect
          x="330"
          y="80"
          width="520"
          height="250"
          rx="5"
          fill="#405d42"
        />

        {/* CONTAINER LINES */}

        {Array.from({ length: 15 }).map((_, index) => (
          <line
            key={index}
            x1={350 + index * 34}
            y1="90"
            x2={350 + index * 34}
            y2="320"
            stroke="#557357"
            strokeWidth="3"
          />
        ))}


        {/* CONTAINER TOP */}

        <line
          x1="330"
          y1="80"
          x2="850"
          y2="80"
          stroke="#263d29"
          strokeWidth="8"
        />


        {/* SMARTFREIGHT TEXT */}

        <text
          x="490"
          y="210"
          fill="white"
          fontSize="38"
          fontWeight="700"
        >
          » SMARTFREIGHT
        </text>


        {/* TRUCK CAB */}

        <path
          d="
            M100 300
            L150 220
            L350 220
            L400 300
            L400 390
            L100 390
            Z
          "
          fill="#f5f6f4"
          stroke="#252b27"
          strokeWidth="5"
        />


        {/* WINDSHIELD */}

        <path
          d="
            M165 235
            L330 235
            L360 285
            L145 285
            Z
          "
          fill="#38423c"
        />


        {/* FRONT */}

        <rect
          x="100"
          y="300"
          width="300"
          height="90"
          rx="10"
          fill="#f5f6f4"
        />


        {/* GRILLE */}

        <rect
          x="175"
          y="345"
          width="150"
          height="30"
          rx="5"
          fill="#252b27"
        />

        {Array.from({ length: 8 }).map((_, index) => (
          <line
            key={index}
            x1={190 + index * 18}
            y1="350"
            x2={190 + index * 18}
            y2="370"
            stroke="#69716c"
            strokeWidth="2"
          />
        ))}


        {/* HEADLIGHTS */}

        <ellipse
          cx="125"
          cy="345"
          rx="14"
          ry="9"
          fill="#dce8d8"
        />

        <ellipse
          cx="375"
          cy="345"
          rx="14"
          ry="9"
          fill="#dce8d8"
        />


        {/* SMARTFREIGHT LOGO ON TRUCK */}

        <text
          x="160"
          y="320"
          fill="#405d42"
          fontSize="19"
          fontWeight="700"
        >
          » SMARTFREIGHT
        </text>


        {/* TRAILER */}

        <rect
          x="380"
          y="300"
          width="500"
          height="40"
          fill="#d6d9d6"
        />


        {/* WHEELS */}

        <circle
          cx="190"
          cy="405"
          r="42"
          fill="#252b27"
        />

        <circle
          cx="190"
          cy="405"
          r="20"
          fill="#aeb4af"
        />

        <circle
          cx="420"
          cy="405"
          r="42"
          fill="#252b27"
        />

        <circle
          cx="420"
          cy="405"
          r="20"
          fill="#aeb4af"
        />

        <circle
          cx="720"
          cy="405"
          r="42"
          fill="#252b27"
        />

        <circle
          cx="720"
          cy="405"
          r="20"
          fill="#aeb4af"
        />

        <circle
          cx="800"
          cy="405"
          r="42"
          fill="#252b27"
        />

        <circle
          cx="800"
          cy="405"
          r="20"
          fill="#aeb4af"
        />

      </svg>

    </div>
  );
};

export default TruckIllustration;