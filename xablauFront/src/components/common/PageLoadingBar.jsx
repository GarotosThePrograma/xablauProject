import { Box } from '@chakra-ui/react';

export function PageLoadingBar({ top = '124px' }) {
  return (
    <Box
      position="fixed"
      top={top}
      left="0"
      right="0"
      h="3px"
      bg="transparent"
      overflow="hidden"
      zIndex="10000"
    >
      <Box
        h="100%"
        w="42%"
        bg="#e27d35"
        boxShadow="0 0 12px rgba(226, 125, 53, 0.65)"
        animation="page-loading-bar 1.05s ease-in-out infinite"
      />
    </Box>
  );
}
