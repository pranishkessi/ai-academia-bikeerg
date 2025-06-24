// src/components/AvatarChatMessage.jsx

import React, { useEffect, useState } from "react";
import { Box, Text, useToast } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

function AvatarChatMessage({ message, onClear }) {
  const toast = useToast();
  const [showTyping, setShowTyping] = useState(false);
  const [visibleMessage, setVisibleMessage] = useState(null);

  // Toast logic
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

  // Bubble + float logic
  useEffect(() => {
    if (!message || message.type === "toast") return;

    setShowTyping(false);
    setVisibleMessage(null);

    if (message.type === "bubble") {
      setShowTyping(true);
      const typingTimer = setTimeout(() => {
        setShowTyping(false);
        setVisibleMessage(message.text);
        const clearTimer = setTimeout(() => {
          onClear();
        }, 4000);
        return () => clearTimeout(clearTimer);
      }, 1500);
      return () => clearTimeout(typingTimer);
    }

    if (message.type === "float") {
      setVisibleMessage(message.text);
      const timer = setTimeout(() => onClear(), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  if (!message || (!showTyping && !visibleMessage)) return null;

  return (
    <AnimatePresence>
      <MotionBox
        key="chat-box"
        position="relative"
        width="100%"
        bg="blue.100"
        borderRadius="xl"
        px={6}
        py={4}
        textAlign="center"
        fontSize="xl"
        fontWeight="bold"
        color="gray.800"
        boxShadow="lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Text>{showTyping ? "..." : visibleMessage}</Text>
      </MotionBox>
    </AnimatePresence>
  );
}

export default AvatarChatMessage;
