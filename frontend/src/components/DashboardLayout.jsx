import React from "react";
import {
  Box,
  Grid,
  GridItem,
  Button,
  Text,
  VStack,
  Heading,
} from "@chakra-ui/react";
import SpeedometerChart from "./SpeedometerChart"; // Import the speedometer chart

function DashboardLayout({ metrics, onStart, onStop, isStartDisabled }) {
  return (
    <Box border="2px solid gray" borderRadius="md" p={4}>
      <Grid
        templateColumns="repeat(7, 1fr)"
        templateRows="auto auto auto"
        gap={4}
      >
        {/* Row 1 - Start/Stop + Metrics */}
        <GridItem colSpan={1}>
          <VStack spacing={2}>
            <Button
              colorScheme="green"
              size="lg"
              onClick={onStart}
              isDisabled={isStartDisabled}
            >
              Start
            </Button>
            <Button colorScheme="red" size="lg" onClick={onStop}>
              Stop
            </Button>
          </VStack>
        </GridItem>

        {["Power", "Stroke", "Distance", "Time", "Energy", "Status"].map(
          (label, index) => (
            <GridItem
              key={label}
              colSpan={1}
              bg="gray.100"
              borderRadius="md"
              textAlign="center"
              py={2}
            >
              <Heading as="h3" size="sm">
                {label}
              </Heading>
              <Text mt={2} fontSize="md">
                {metrics[label.toLowerCase()]}
              </Text>
            </GridItem>
          )
        )}

        {/* Row 2 - Speedometer + Line Chart */}
        <GridItem colSpan={3} rowSpan={1}>
          <Box
            height="100%"
            border="1px solid gray"
            borderRadius="md"
            p={4}
            textAlign="center"
            bg="white"
          >
            <SpeedometerChart energy={metrics.energy} />
          </Box>
        </GridItem>

        <GridItem colSpan={4} rowSpan={1}>
          <Box
            height="100%"
            border="1px solid gray"
            borderRadius="md"
            p={4}
            textAlign="center"
            bg="white"
          >
            <Text fontWeight="bold" mb={2}>📈 Live Power & Stroke</Text>
            {/* Line Chart will render here */}
          </Box>
        </GridItem>

        {/* Row 3 - AI Task + Info Box */}
        <GridItem colSpan={3}>
          <Box border="1px solid gray" borderRadius="md" p={4}>
            {/* AI Task Unlocking Sequence will render here */}
            {/* Handled from App.jsx via <TaskUnlockList /> */}
          </Box>
        </GridItem>

        <GridItem colSpan={4}>
          <Box border="1px solid gray" borderRadius="md" p={4}>
            {/* Reserved for future: Tooltip / AI info / Confetti */}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default DashboardLayout;
