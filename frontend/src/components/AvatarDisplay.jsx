// src/components/AvatarDisplay.jsx

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Box } from "@chakra-ui/react";
import AvatarMessageBox from "./AvatarMessageBox";

const AvatarDisplay = ({ message }) => {
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
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-end"
      position="relative"
      overflow="visible"
    >
      {/* Unified Message Box ABOVE the avatar */}
      <Box
        position="absolute"
        top="0"
        width="100%"
        px={2}
        pt={2}
        display="flex"
        justifyContent="center"
        zIndex={10}
      >
        <AvatarMessageBox text={message?.text} kind={message?.kind || "default"} />
      </Box>

      {/* Avatar */}
      {animationData && (
        <Box width="100%" maxWidth="520px">
          <Lottie
            animationData={animationData}
            loop
            autoplay
            style={{ width: "100%", height: "100%", background: "transparent" }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AvatarDisplay;
