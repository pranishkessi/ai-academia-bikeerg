// src/components/AvatarDisplay.jsx

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Box } from "@chakra-ui/react";

const AvatarDisplay = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    fetch("/animations/friendly-robot.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));
  }, []);

  return (
<Box
  bg="transparent"
  p={0}
  borderRadius="none"
  boxShadow="none"
  minHeight="320px"
  maxHeight="320px"
  display="flex"
  alignItems="center"
  justifyContent="center"
>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{
            width: "80%",
            height: "80%",
            background: "transparent",
          }}
        />
      )}
    </Box>
  );
};

export default AvatarDisplay;
