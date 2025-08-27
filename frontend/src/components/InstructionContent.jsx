// src/components/InstructionModal.jsx
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Heading,
  Text,
  SimpleGrid,
  HStack,
  VStack,
  List,
  ListItem,
  ListIcon,
  Image,
  Divider,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningTwoIcon, InfoOutlineIcon } from "@chakra-ui/icons";
import { FaPlay, FaStop } from "react-icons/fa";

/**
 * Full-screen Instruction Modal (landscape, no scrollbars).
 *
 * Usage:
 * <InstructionModal isOpen={isOpen} onClose={onClose} />
 *
 * Place images in /public/instructions:
 *  - /instructions/bike_overview.jpg
 *  - /instructions/saddle_lock.jpg
 *  - /instructions/handlebar_lock.jpg
 */
export default function InstructionModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" isCentered={false}>
      <ModalOverlay />
      <ModalContent
        p={0}
        m={0}
        maxW="100vw"
        h="100vh"
        borderRadius="0"
        overflow="hidden" // prevents any inner scrollbars
        bg="white"
      >
        <ModalCloseButton top={4} right={6} zIndex={2} />

        <ModalBody p={0}>
          <InstructionContent />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

/** Inner content – fills the entire viewport provided by the modal */
function InstructionContent() {
  return (
    <Box
      w="100%"
      h="100%"
      p={8}
      bg="white"
      display="flex"
      flexDirection="column"
      overflow="hidden" // hard block any scroll
    >
      {/* Title row */}
      <HStack justify="space-between" mb={6} flexShrink={0}>
        <Heading size="xl">Anleitung</Heading>
        <Badge px={3} py={1} rounded="full">AI Academia</Badge>
      </HStack>

      {/* Landscape 2-column layout; no scrolling — content is sized to fit */}
      <SimpleGrid
        columns={2}
        spacing={12}
        flex="1"
        alignItems="start"
        templateColumns="1.2fr 0.8fr" // 60/40 balance
      >
        {/* LEFT: Text */}
        <VStack align="stretch" spacing={6}>
          {/* Safety */}
          <Box>
            <HStack mb={2}>
              <Icon as={WarningTwoIcon} />
              <Heading size="md">Sicherheitshinweise</Heading>
            </HStack>
            <List spacing={1} fontSize="md">
              <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Überprüfen Sie, ob Sattel und Lenker sicher befestigt sind.</ListItem>
              <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Tragen Sie geeignete, geschlossene Schuhe.</ListItem>
              <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Kinder nur mit Aufsicht nutzen; Mindestgröße 128&nbsp;cm.</ListItem>
              <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Nicht benutzen, wenn das Ergometer nass oder instabil ist.</ListItem>
              <ListItem><ListIcon as={CheckCircleIcon} color="green.500" />Beenden Sie das Experiment bei Schwindel oder Unwohlsein.</ListItem>
            </List>
          </Box>

          {/* Adjustments */}
          <Box>
            <HStack mb={2}>
              <Icon as={InfoOutlineIcon} />
              <Heading size="md">Sattel &amp; Lenker einstellen</Heading>
            </HStack>

            <Heading size="sm" mb={1}>Sattelhöhe</Heading>
            <Text fontSize="sm" mb={2}>
              Das Bein soll in der untersten Pedalstellung leicht gebeugt sein. Minimale Sattelhöhe: <b>73&nbsp;cm</b> (Innenbein ca. 66–89&nbsp;cm).
            </Text>
            <List spacing={1} fontSize="sm" mb={3}>
              <ListItem>1) Sperrriegel nach unten drücken</ListItem>
              <ListItem>2) Sattel in gewünschte Höhe bewegen</ListItem>
              <ListItem>3) Sperrriegel wieder loslassen</ListItem>
            </List>

            <Heading size="sm" mb={1}>Lenkerhöhe &amp; Vorbaulänge</Heading>
            <Text fontSize="sm" mb={2}>
              Lenker bequem erreichbar greifen; vertikal und horizontal verstellbar. Lenkerhöhe ca. <b>56,5–77&nbsp;cm</b>.
            </Text>
            <List spacing={1} fontSize="sm">
              <ListItem>
                <b>Höhe:</b> untere Schraube lösen → Sperrriegel drücken →
                Höhe einstellen → Sperrriegel loslassen → Schraube leicht anziehen
              </ListItem>
              <ListItem>
                <b>Vorbaulänge:</b> obere Schraube lösen → Position einstellen → Schraube leicht anziehen
              </ListItem>
            </List>
          </Box>

          {/* Mission steps */}
          <Box>
            <HStack mb={2}>
              <Icon as={InfoOutlineIcon} />
              <Heading size="md">Mission starten &amp; Energie erzeugen</Heading>
            </HStack>
            <List spacing={1} fontSize="md">
              <ListItem>1) Sattel &amp; Lenker einstellen</ListItem>
              <ListItem>2) Aufsitzen und auf den Bildschirm schauen</ListItem>
              <ListItem>3) <b>START</b> drücken (grüne Taste oben links)</ListItem>
              <ListItem>4) Losradeln – Live-Werte erscheinen</ListItem>
              <ListItem>5) KI-Aufgaben freischalten</ListItem>
              <ListItem>6) Zum Beenden <b>STOP</b> drücken (rote Taste)</ListItem>
            </List>
          </Box>

          {/* Unlock tasks */}
          <Box>
            <HStack mb={2}>
              <Icon as={InfoOutlineIcon} />
              <Heading size="md">Freischaltbare KI-Aufgaben</Heading>
            </HStack>
            <List spacing={1} fontSize="md">
              <ListItem>• 6 Suchanfragen an Google</ListItem>
              <ListItem>• Eine Bilderkennung</ListItem>
              <ListItem>• 20 einfache ChatGPT-Abfragen</ListItem>
              <ListItem>• Eine Text-zu-Sprache Umwandlung</ListItem>
            </List>
          </Box>
        </VStack>

        {/* RIGHT: Images + START/STOP badges (all sized to fit; no scroll) */}
        <VStack align="stretch" spacing={5}>
          <HStack spacing={4}>
            <HStack px={3} py={2} rounded="full" bg="green.500" color="white">
              <Icon as={FaPlay} />
              <Text fontWeight="bold">START</Text>
            </HStack>
            <HStack px={3} py={2} rounded="full" bg="red.500" color="white">
              <Icon as={FaStop} />
              <Text fontWeight="bold">STOP</Text>
            </HStack>
          </HStack>

          {/* IMPORTANT: fixed small heights so everything fits without scroll */}
          <Box>
            <Heading size="sm" mb={1}>Lenker &amp; Vorbau</Heading>
            <Image
              src="/instructions/bike_overview.jpg"
              alt="BikeErg Übersicht"
              maxH="160px"
              w="100%"
              objectFit="contain"
              rounded="md"
            />
          </Box>

          <Box>
            <Heading size="sm" mb={1}>Sattelsäule – Mechanik</Heading>
            <Image
              src="/instructions/saddle_lock.jpg"
              alt="Sattelsäule"
              maxH="160px"
              w="100%"
              objectFit="contain"
              rounded="md"
            />
          </Box>

          <Box>
            <Heading size="sm" mb={1}>Grifflänge anpassen</Heading>
            <Image
              src="/instructions/handlebar_lock.jpg"
              alt="Lenker & Vorbau"
              maxH="160px"
              w="100%"
              objectFit="contain"
              rounded="md"
            />
          </Box>

          <Divider />

          {/* tiny footer to keep symmetry; optional */}
          <Text fontSize="xs" color="gray.500">
            Hinweis: Dieses Ausstellungsstück verarbeitet keine personenbezogenen Daten. Es werden keinerlei Daten gespeichert oder aufgezeichnet.
          </Text>
        </VStack>
      </SimpleGrid>
    </Box>
  );
}
