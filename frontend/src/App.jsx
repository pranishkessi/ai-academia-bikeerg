import { ChakraProvider, Box, Text, Button, VStack } from "@chakra-ui/react";

export default function App() {
  return (
    <ChakraProvider>
      <VStack minH="100vh" justify="center" bg="gray.100" p={5}>
        <Box bg="white" p={6} rounded="md" shadow="lg" textAlign="center">
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            🚀 Chakra UI is Working!
          </Text>
          <Button colorScheme="blue" size="lg">
            Click Me
          </Button>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
