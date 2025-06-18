import React, { useEffect } from "react";
import { Box, Text, useToast } from "@chakra-ui/react";
import { motion, AnimatePresence, transform } from "framer-motion";

const MotionBox = motion(Box);

function AvatarChatMessage({ message, onClear }) {
  const toast = useToast();

  // Always call hooks first — no conditionals before this
  useEffect(() => {
    if (message?.type === "toast" && message.text) {
      toast({
        title: message.text,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      onClear();
    }
  }, [message, toast, onClear]);

  // Auto-dismiss for bubble/float
  useEffect(() => {
    if (message?.type === "bubble" || message?.type === "float") {
      const timer = setTimeout(() => {
        onClear();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  // Early exit only after hooks
  if (!message?.text || message.type === "toast") return null;

  // Style for each message type
  const positionStyles =
  message.type === "bubble"
    ? {
        bottom: "20px",
        right: "90%",
        transform: "translateX(20%)",
        maxWidth: "180px",
      }
    : {
        bottom: "100%",
        right: "50%",
        transform: "translateX(-50%)",
        mb: 2,
        maxWidth: "200px",
      };

  return (
    <AnimatePresence>
      <MotionBox
        key="avatar-message"
        position="absolute"
        bg="white"
        p={3}
        borderRadius="xl"
        boxShadow="lg"
        zIndex={10}
        fontSize="sm"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        {...positionStyles}
      >
        <Text>{message.text}</Text>
      </MotionBox>
    </AnimatePresence>
  );
}

export default AvatarChatMessage;
