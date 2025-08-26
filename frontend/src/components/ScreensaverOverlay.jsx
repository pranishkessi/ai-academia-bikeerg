import { Box, Text } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import InstructionContent from "./InstructionContent";

const MotionBox = motion(Box);

/**
 * Fullscreen overlay that:
 * - Shows after idle (isOpen = true)
 * - Dismisses on any pointer down (onDismiss)
 * - Reuses InstructionContent (compact layout)
 */
export default function ScreensaverOverlay({
  isOpen,
  onDismiss,
  lang = "en",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <MotionBox
          position="fixed"
          inset="0"
          zIndex={9999}
          bg="rgba(0,0,0,0.7)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onPointerDown={onDismiss}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MotionBox
            maxW="1100px"
            w={{ base: "92%", md: "90%" }}
            bg="white"
            rounded="2xl"
            p={{ base: 5, md: 8 }}
            boxShadow="2xl"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
          >
            <InstructionContent lang={lang} compact />
            <Text mt={6} textAlign="center" opacity={0.7}>
              Tap / Click anywhere to return to the dashboard
            </Text>
          </MotionBox>
        </MotionBox>
      )}
    </AnimatePresence>
  );
}
