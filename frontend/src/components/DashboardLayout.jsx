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
import SpeedometerChart from "./SpeedometerChart";
import LineChartLive from "./LineChartLive";
import TaskUnlockList from "./TaskUnlockList";

function DashboardLayout({ metrics, onStart, onStop, energy }) {
  return (
    <Box border="2px solid gray" borderRadius="md" p={4} height="100%">
      <Grid
        templateColumns="repeat(7, 1fr)"
        templateRows="auto auto auto"
        gap={4}
        height="100%"
      >
        {/* Row 1 - Start/Stop + Metrics */}
        <GridItem colSpan={1}>
          <VStack spacing={2}>
            <Button colorScheme="green" size="lg" onClick={onStart}>
              Start
            </Button>
            <Button colorScheme="red" size="lg" onClick={onStop}>
              Stop
            </Button>
          </VStack>
        </GridItem>

        {["Power", "Stroke", "Distance", "Time", "Energy", "Status"].map(
          (label) => (
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
        <GridItem colSpan={3}>
          <Box
            height="100%"
            border="1px solid gray"
            borderRadius="md"
            p={4}
            bg="white"
          >
            <SpeedometerChart energy={metrics.energy} />
          </Box>
        </GridItem>

        <GridItem colSpan={4}>
          <Box
            height="300px"
            overflow="hidden"
            border="1px solid gray"
            borderRadius="md"
            p={4}
            textAlign="center"
            bg="white"
          >
            <Text fontWeight="bold" mb={2}>Live Power & Stroke</Text>
            <LineChartLive power={metrics.power} stroke={metrics.stroke} />
          </Box>
        </GridItem>

        {/* Row 3 - AI Tasks + Info Box */}
        <GridItem colSpan={3}>
          <Box border="1px solid gray" borderRadius="md" p={4}>
            <TaskUnlockList energy={energy} />
          </Box>
        </GridItem>

        <GridItem colSpan={4}>
          <Box border="1px solid gray" borderRadius="md" p={4}>
            {/* Future enhancements like tooltips, confetti etc */}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default DashboardLayout;
