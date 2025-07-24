// src/components/AvatarChatMessage.jsx

import React from "react";
import { Box, Text, useToast } from "@chakra-ui/react";
import bubbleImage from "/speech_bubble_3.svg"; // adjust if needed

const AvatarChatMessage = ({ message, onClear }) => {
  const toast = useToast();

  // Show toast only once
  React.useEffect(() => {
    if (message?.type === "toast") {
      toast({
        title: message.text,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom-center",
      });
      if (onClear) onClear();
    }
  }, [message, toast, onClear]);

  // Bubble SVG
  if (message?.type === "bubble") {
    return (
      <Box
        position="absolute"
        top="-220px"
        left="50%"
        transform="translateX(-50%)"
        width="480px"
        height="360px"
        backgroundImage={`url(${bubbleImage})`}
        backgroundSize="contain"
        backgroundRepeat="no-repeat"
        backgroundPosition="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
        py={3}
        zIndex={10}
      >
        <Text
          fontSize="md"
          fontWeight="bold"
          textAlign="center"
          maxWidth="260px"
          wordBreak="break-word"
          lineHeight="short"
          mt="8px"
        >
          {message.text}
        </Text>
      </Box>
    );
  }

  // Floating style
  if (message?.type === "float") {
    return (
      <Box
        position="absolute"
        top="-30px"
        right="40%"
        bg="blue.100"
        px={6}
        py={2}
        borderRadius="md"
        boxShadow="lg"
        zIndex={10}
        animation="floatFade 0.5s ease"
      >
        <Text fontSize="md" fontWeight="semibold">
          {message.text}
        </Text>
      </Box>
    );
  }

  return null;
};

export default AvatarChatMessage;
