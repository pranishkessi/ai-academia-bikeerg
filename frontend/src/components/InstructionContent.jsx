import { Box, Heading, Text, SimpleGrid, HStack, Icon, VStack, Badge } from "@chakra-ui/react";
import { FaBicycle, FaPlay, FaStop, FaLanguage, FaEye } from "react-icons/fa";

const CONTENT = {
  en: {
    title: "How to Use the AI Academia BikeErg",
    steps: [
      { icon: FaBicycle, heading: "Adjust the Bike", text: "Set the saddle height and handlebar to a comfortable position." },
      { icon: FaPlay, heading: "Start Pedaling", text: "Press Start. Your pedaling generates energy to unlock AI tasks." },
      { icon: FaEye, heading: "Watch the Dashboard", text: "Track Power, Stroke, Distance, Time, Energy, and unlocked AI tasks." },
      { icon: FaStop, heading: "Stop Safely", text: "Press Stop to end the session and view your summary." },
    ],
    footer: "Tip: Stay steady to unlock more AI tasks!",
  },
  de: {
    title: "So nutzen Sie das AI Academia BikeErg",
    steps: [
      { icon: FaBicycle, heading: "Fahrrad einstellen", text: "Passen Sie Sattelhöhe und Lenker auf eine bequeme Position an." },
      { icon: FaPlay, heading: "Losradeln", text: "Drücken Sie Start. Ihre Energie schaltet AI‑Aufgaben frei." },
      { icon: FaEye, heading: "Dashboard beobachten", text: "Verfolgen Sie Leistung, Schlagfrequenz, Distanz, Zeit, Energie und freigeschaltete AI‑Aufgaben." },
      { icon: FaStop, heading: "Sicher beenden", text: "Drücken Sie Stop, um die Sitzung zu beenden und die Übersicht zu sehen." },
    ],
    footer: "Tipp: Gleichmäßig fahren, um mehr AI‑Aufgaben freizuschalten!",
  },
};

export default function InstructionContent({ lang = "en", compact = false }) {
  const c = CONTENT[lang] ?? CONTENT.en;

  return (
    <Box w="100%">
      <VStack spacing={compact ? 4 : 8} align="stretch">
        <HStack justify="space-between">
          <Heading size={compact ? "lg" : "xl"}>{c.title}</Heading>
          <Badge fontSize={compact ? "0.7rem" : "0.8rem"} px={3} py={1} rounded="full">AI Academia</Badge>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={compact ? 4 : 6}>
          {c.steps.map((s, i) => (
            <HStack key={i} align="flex-start" p={compact ? 3 : 4} rounded="2xl" boxShadow="sm" bg="whiteAlpha.900">
              <Icon as={s.icon} boxSize={compact ? 6 : 8} />
              <Box>
                <Heading size={compact ? "md" : "lg"} mb={1}>{s.heading}</Heading>
                <Text fontSize={compact ? "sm" : "md"}>{s.text}</Text>
              </Box>
            </HStack>
          ))}
        </SimpleGrid>

        <Text fontWeight="medium" opacity={0.8}>{c.footer}</Text>
      </VStack>
    </Box>
  );
}
