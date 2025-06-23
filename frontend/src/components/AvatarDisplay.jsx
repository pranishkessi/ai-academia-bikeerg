// src/components/AvatarDisplay.jsx

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Box } from "@chakra-ui/react";
import AvatarChatMessage from "./AvatarChatMessage";

const AvatarDisplay = ({ message, onClear }) => {
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
  minHeight="720px"
  maxHeight="720px"
  display="flex"
  alignItems="center"
  justifyContent="center"
  position="relative"
  overflow="visible" // ✅ prevent clipping
>
      {animationData && (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{
            width: "100%",
            height: "100%",
            background: "transparent",
          }}
        />
      )}
      <AvatarChatMessage message={message} onClear={onClear} />
    </Box>
  );
};

export default AvatarDisplay;
